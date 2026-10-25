import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCasePrompt, classifyGeminiError, generationRequestSchema, validateGeneratedCase } from './generation.js';

const request = generationRequestSchema.parse({ scenario: 'A locked archive loses a single map during a storm.', category: 'Theft', difficulty: 'medium', suspectCount: 3, options: { redHerrings: true } });

function validDraft() {
  const suspects = [1, 2, 3].map(n => ({ id: `s${n}`, name: `Suspect ${n}`, role: 'Archive visitor', age: 30 + n, initials: `S${n}`, color: '#b77855', tag: 'VISITOR', bio: 'A visitor with a clear connection to the archive.', motive: 'They each have a reason to want the map.', alibi: 'They state that they were in the reading room.' }));
  const evidence = Array.from({ length: 6 }, (_, i) => ({ id: `e${i + 1}`, type: 'DOCUMENT' as const, title: `Record ${i + 1}`, time: '9:00 PM', source: 'Archive', summary: 'A concrete detail in the case file.', detail: 'This record contains a verifiable observation from that evening.', related: ['s1'], icon: 'file' as const, accent: '#d5a565' }));
  return {
    title: 'The Missing Map', subtitle: 'A locked room and an open question', location: 'North archive', date: 'OCT 25, 2026', difficulty: 'MEDIUM' as const,
    summary: 'A valuable map disappeared from a locked archive during a storm, and three visitors remain under suspicion.', suspects, evidence,
    timeline: Array.from({ length: 5 }, (_, i) => ({ time: `${8 + i}:00 PM`, title: `Event ${i + 1}`, detail: 'A recorded event in the archive.' })),
    clues: [1, 2, 3].map(n => ({ id: `c${n}`, description: 'A checkable clue from the case file.', evidenceIds: [`e${n}`], suspectIds: ['s1'] })),
    culprit: 's1', solution: 'The archive visitor removed the map after the storm cut the lights. Two records place them in the restricted room, while the other accounts are confirmed.',
    supportingEvidenceIds: ['e1', 'e2'], redHerringExplanations: [{ evidenceId: 'e3', explanation: 'This record looks suspicious but refers to an earlier inventory correction.' }],
  };
}

test('request schema preserves category, difficulty, suspect count, and red-herrings option', () => {
  assert.deepEqual(request.options, { redHerrings: true });
  assert.equal(request.category, 'Theft');
  assert.equal(request.suspectCount, 3);
  assert.equal(generationRequestSchema.safeParse({ scenario: 'too short' }).success, false);
});

test('validates a complete case and rejects dangling references', () => {
  assert.equal(validateGeneratedCase(validDraft(), request).culprit, 's1');
  const invalid = validDraft();
  invalid.clues[0].evidenceIds = ['missing-evidence'];
  assert.throws(() => validateGeneratedCase(invalid, request), /missing evidence/);
});

test('enforces the red-herrings setting and includes it in the prompt', () => {
  assert.match(buildCasePrompt(request), /include 1-2 plausible misleading leads/);
  const noHerringRequest = generationRequestSchema.parse({ ...request, options: { redHerrings: false } });
  assert.match(buildCasePrompt(noHerringRequest), /disabled; return an empty redHerringExplanations array/);
  const missingHerringDraft = validDraft();
  missingHerringDraft.redHerringExplanations = [];
  assert.throws(() => validateGeneratedCase(missingHerringDraft, request), /Red herrings were requested/);
  assert.doesNotThrow(() => validateGeneratedCase(missingHerringDraft, noHerringRequest));
  assert.throws(() => validateGeneratedCase(validDraft(), noHerringRequest), /Red herrings were disabled/);
});

test('maps common Gemini credential, quota, model, and network failures to safe codes', () => {
  assert.equal(classifyGeminiError({ status: 401, message: 'Unauthorized' }), 'GEMINI_KEY_INVALID');
  assert.equal(classifyGeminiError({ status: 429, message: 'resource exhausted' }), 'GEMINI_QUOTA_LIMIT');
  assert.equal(classifyGeminiError({ status: 404, message: 'model not found' }), 'GEMINI_MODEL_UNSUPPORTED');
  assert.equal(classifyGeminiError({ status: 503, message: 'Service unavailable' }), 'GEMINI_SERVICE_UNAVAILABLE');
  assert.equal(classifyGeminiError({ status: 504, message: 'Gateway timeout' }), 'GEMINI_TIMEOUT');
  assert.equal(classifyGeminiError({ code: 'ECONNRESET', message: 'socket hang up' }), 'GEMINI_NETWORK_ERROR');
});
