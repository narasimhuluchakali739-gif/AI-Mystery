import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { CaseOutputError, classifyGeminiError, generateValidatedCase, generationRequestSchema, safeGeminiError } from './generation.js';

const apiDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: resolve(apiDirectory, '../../.env') });

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const allowedOrigins = new Set((process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(origin => origin.trim()).filter(Boolean));
app.use(cors({ origin: (origin, callback) => {
  const renderOrigin = process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : '';
  callback(null, !origin || allowedOrigins.has(origin) || origin === renderOrigin);
} }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/v1', rateLimit({ windowMs: 60_000, limit: 12, standardHeaders: true, legacyHeaders: false, skip: req => req.path === '/health' }));
const webDistPath = resolve(apiDirectory, '../web/dist');
if (process.env.NODE_ENV === 'production') app.use(express.static(webDistPath, { index: false }));

const recordSchema = new mongoose.Schema({ caseId: { type: String, unique: true, index: true }, payload: { type: mongoose.Schema.Types.Mixed, required: true }, culprit: { type: String, required: true }, solution: { type: String, required: true }, supportingEvidenceIds: [String], redHerringExplanations: [mongoose.Schema.Types.Mixed], createdAt: { type: Date, default: Date.now } }, { versionKey: false });
type CaseRecordDocument = mongoose.InferSchemaType<typeof recordSchema> & mongoose.Document;
const CaseRecord = (mongoose.models.CaseRecord as mongoose.Model<CaseRecordDocument> | undefined) ?? mongoose.model<CaseRecordDocument>('CaseRecord', recordSchema);
const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const geminiModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey, httpOptions: { timeout: 60_000 } }) : null;
const demoCase = {
  id: 'MR-0842', culprit: 's4', solution: 'Jonah Reed cut the power to remove the 1943 lens. The supposedly faulty fuse was intact, the maintenance ledger shows he signed out a replacement that was never installed, and the camera clock places a figure carrying a rectangular object on the north stair. The dust on the print ties the route to the west path he maintained. The messages reveal Elias had discovered the tampered account.',
  suspects: [{id:'s1'},{id:'s2'},{id:'s3'},{id:'s4'}]
};

app.get('/api/v1/health', (_req, res) => {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const generator = ai ? 'configured' : 'not-configured';
  const ready = database === 'connected' && generator === 'configured';
  return res.status(ready ? 200 : 503).json({ success: ready, data: { status: ready ? 'ready' : 'not-ready', database, generator, model: geminiModel }, error: ready ? null : { code: 'SERVICE_NOT_READY', message: 'Database or Gemini configuration is unavailable.' } });
});

app.post('/api/v1/cases', async (req, res) => {
  const parsed = generationRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Please check your input.' } });
  if (!ai) return res.status(503).json({ success: false, data: null, error: { code: 'GEMINI_KEY_MISSING', message: 'Gemini is not configured. Add GEMINI_API_KEY to the project root .env file and restart the API.' } });
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, data: null, error: { code: 'DATABASE_UNAVAILABLE', message: 'Case storage is not connected. Check MONGODB_URI.' } });
  try {
    const data = await generateValidatedCase(ai, geminiModel, parsed.data);
    const id = `MR-${randomUUID().slice(0, 8).toUpperCase()}`;
    const { culprit, solution, supportingEvidenceIds, redHerringExplanations, ...publicFields } = data;
    const publicCase = { ...publicFields, id };
    await CaseRecord.create({ caseId: id, payload: publicCase, culprit, solution, supportingEvidenceIds, redHerringExplanations });
    return res.status(201).json({ success: true, data: { case: publicCase }, error: null });
  } catch (err) {
    if (err instanceof CaseOutputError) return res.status(502).json({ success: false, data: null, error: { code: 'GEMINI_INVALID_RESPONSE', message: 'Gemini returned a case that failed consistency checks after one retry. Try again or adjust the scenario.' } });
    const code = classifyGeminiError(err);
    const safe = safeGeminiError(code);
    const diagnostic = err as { status?: unknown; error?: { status?: unknown; code?: unknown } };
    const httpStatus = typeof diagnostic?.status === 'number' ? diagnostic.status : 'unknown';
    const providerStatus = typeof diagnostic?.error?.status === 'string' ? diagnostic.error.status.replace(/[^A-Za-z0-9_]/g, '').slice(0, 40) : 'unknown';
    console.error(`Gemini generation failed (${code}; http=${httpStatus}; provider=${providerStatus}).`);
    return res.status(safe.status).json({ success: false, data: null, error: { code, message: safe.message } });
  }
});

app.post('/api/v1/cases/:caseId/accusations', async (req, res) => {
  const suspectId = z.string().min(1).safeParse(req.body?.suspectId);
  if (!suspectId.success) return res.status(422).json({ success: false, data: null, error: { code: 'INVALID_SUSPECT', message: 'Select a suspect in this case.' } });
  try {
    const found = await CaseRecord.findOne({ caseId: req.params.caseId }).lean();
    if (!found) return res.status(404).json({ success: false, data: null, error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' } });
    const publicCase = found.payload as { suspects?: { id: string }[] };
    if (!publicCase.suspects?.some(s => s.id === suspectId.data)) return res.status(422).json({ success: false, data: null, error: { code: 'INVALID_SUSPECT', message: 'That suspect does not belong to this case.' } });
    return res.json({ success: true, data: { correct: found.culprit === suspectId.data, selectedSuspectId: suspectId.data, culprit: found.culprit, solution: found.solution, supportingEvidenceIds: found.supportingEvidenceIds ?? [], redHerringExplanations: found.redHerringExplanations ?? [], completed: true }, error: null });
  } catch { return res.status(503).json({ success: false, data: null, error: { code: 'DATABASE_UNAVAILABLE', message: 'The case verdict could not be retrieved.' } }); }
});

app.get('/api/v1/cases/:caseId', async (req, res) => {
  try { const found = await CaseRecord.findOne({ caseId: req.params.caseId }).lean(); if (!found) return res.status(404).json({ success:false,data:null,error:{code:'CASE_NOT_FOUND',message:'Case not found.'} }); return res.json({success:true,data:{case:found.payload},error:null}); }
  catch { return res.status(503).json({success:false,data:null,error:{code:'DATABASE_UNAVAILABLE',message:'Case storage is unavailable.'}}); }
});

app.use('/api', (_req, res) => res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Route not found.' } }));
if (process.env.NODE_ENV === 'production') app.get('*', (_req, res) => res.sendFile(resolve(webDistPath, 'index.html')));
else app.use((_req, res) => res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Route not found.' } }));
const port = Number(process.env.PORT || 4001);
async function start() {
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in production.');
  if (process.env.NODE_ENV === 'production' && !geminiApiKey) throw new Error('GEMINI_API_KEY is required in production.');
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    await CaseRecord.updateOne({ caseId: demoCase.id }, { $setOnInsert: { caseId: demoCase.id, payload: { suspects: demoCase.suspects }, culprit: demoCase.culprit, solution: demoCase.solution } }, { upsert: true });
    console.log('Connected to MongoDB.');
  } else console.warn('MONGODB_URI is not configured; persistence is unavailable.');
  console.log(`Gemini model configured: ${geminiModel}`);
  const server = app.listen(port, '0.0.0.0', () => console.log(`Mystery Room API listening on ${port}`));
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. Stop the other NXT WAVE dev server before restarting.`);
    else console.error('API could not bind to its configured port.');
    process.exit(1);
  });
}
start().catch(() => { console.error('API startup failed. Check required environment variables, MongoDB credentials, and Atlas network access.'); process.exit(1); });
