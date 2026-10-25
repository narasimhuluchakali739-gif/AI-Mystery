import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Fingerprint, LockKeyhole, Shield, Sparkles } from 'lucide-react';
import type { CaseData } from './App';

type Props = { onCase: (value: CaseData) => void };

const publicErrorMessages: Record<string, string> = {
  GEMINI_KEY_MISSING: 'The API cannot find GEMINI_API_KEY. Add it to the project root .env file and restart the API.',
  GEMINI_KEY_INVALID: 'Gemini rejected the API key. Check the key in the project root .env and confirm it is enabled for the Gemini API.',
  GEMINI_QUOTA_LIMIT: 'Gemini quota or rate limit reached. Check Google AI Studio usage and try again later.',
  GEMINI_MODEL_UNSUPPORTED: 'The configured Gemini model is unavailable. Check GEMINI_MODEL in the project root .env.',
  GEMINI_NETWORK_ERROR: 'The API could not reach Gemini. Check your network connection and retry.',
  GEMINI_TIMEOUT: 'Gemini took too long to generate this case. Check your connection and retry.',
  GEMINI_SERVICE_UNAVAILABLE: 'Gemini is temporarily unavailable. Retry shortly; if it continues, check Google AI Studio model or API availability.',
  GEMINI_INVALID_RESPONSE: 'Gemini returned a case that did not pass consistency checks. Please retry or adjust the scenario.',
  DATABASE_UNAVAILABLE: 'The case database is unavailable. Check MONGODB_URI and restart the API.',
  VALIDATION_ERROR: 'Check the scenario and case settings, then try again.',
};

function errorTitle(code: string) {
  if (code === 'GEMINI_KEY_MISSING' || code === 'GEMINI_KEY_INVALID') return 'Check your Gemini API key';
  if (code === 'GEMINI_QUOTA_LIMIT') return 'Gemini quota reached';
  if (code === 'GEMINI_MODEL_UNSUPPORTED') return 'Gemini model unavailable';
  if (code === 'GEMINI_NETWORK_ERROR') return 'Connection problem';
  if (code === 'GEMINI_TIMEOUT') return 'Gemini took too long';
  if (code === 'GEMINI_SERVICE_UNAVAILABLE') return 'Gemini is temporarily unavailable';
  if (code === 'GEMINI_INVALID_RESPONSE') return 'The case needs another pass';
  return 'We could not build this case';
}

export default function Create({ onCase }: Props) {
  const navigate = useNavigate();
  const busyRef = useRef(false);
  const [scenario, setScenario] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(4);
  const [category, setCategory] = useState('Detective mystery');
  const [redHerrings, setRedHerrings] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const charsLeft = Math.max(0, 30 - scenario.trim().length);

  const submit = async () => {
    if (busyRef.current) return;
    if (scenario.trim().length < 30) {
      setError({ title: 'Add a little more to the scenario', message: `Write at least 30 characters. ${charsLeft} more ${charsLeft === 1 ? 'character' : 'characters'} needed.` });
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 140_000);
    try {
      const response = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          scenario: scenario.trim(), category, difficulty: difficulty.toLowerCase(), suspectCount: count,
          options: { redHerrings },
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      const envelope = result as { data?: { case?: CaseData }; error?: { code?: string } } | null;
      if (!response.ok) {
        const code = envelope?.error?.code || 'GENERATION_FAILED';
        throw Object.assign(new Error(publicErrorMessages[code] || 'The case service returned an error. Please retry.'), { code });
      }
      const newCase = envelope?.data?.case;
      if (!newCase || typeof newCase.id !== 'string' || typeof newCase.title !== 'string' || !Array.isArray(newCase.suspects) || !Array.isArray(newCase.evidence) || !Array.isArray(newCase.timeline)) {
        throw Object.assign(new Error(publicErrorMessages.GEMINI_INVALID_RESPONSE), { code: 'GEMINI_INVALID_RESPONSE' });
      }
      onCase(newCase);
      navigate(`/case/${newCase.id}`);
    } catch (cause) {
      const errorLike = cause as Error & { code?: string };
      const code = errorLike.code || (errorLike.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR');
      const message = errorLike.name === 'AbortError'
        ? 'Case generation took too long. Check the API logs for a sanitized error, then try again.'
        : errorLike instanceof TypeError
          ? 'The web app could not reach its API. Restart both services with npm run dev and check the Vite proxy.'
          : errorLike.message || 'Please try again.';
      setError({ title: errorTitle(code), message });
    } finally {
      window.clearTimeout(timeout);
      busyRef.current = false;
      setBusy(false);
    }
  };

  return <div className="shell"><header className="topbar"><Link className="brand" to="/"><span className="brand-icon"><Fingerprint size={17}/></span><span>CASEFILE<span className="brand-dot">.</span></span></Link><div className="top-center"><span className="live-dot"/> THE PRIVATE INVESTIGATION ROOM</div></header>
    <main className="create-page"><Link to="/" className="back-link"><ArrowLeft size={14}/> BACK TO CASEFILE</Link><div className="create-grid"><section>
      <div className="eyebrow">YOUR NEXT INVESTIGATION <span className="eyebrow-line"/></div><h1 className="create-title">Begin with<br/><em>a question.</em></h1><p className="create-copy">Give us the first thread. We’ll build the room around it.</p>
      <div className="create-form"><label htmlFor="scenario">THE STARTING POINT <span>30–2,000 CHARACTERS</span></label>
        <textarea id="scenario" maxLength={2000} value={scenario} onChange={event => { setScenario(event.target.value); setError(null); }} aria-describedby="scenario-guidance" placeholder="A curator discovers the gallery's oldest painting has been replaced overnight…"/>
        <div className="textarea-foot" id="scenario-guidance"><span>{charsLeft ? `Add ${charsLeft} more ${charsLeft === 1 ? 'character' : 'characters'} to begin.` : 'Fictional scenarios only.'}</span><span>{scenario.length} / 2,000</span></div>
        <div className="form-row"><div><label htmlFor="category">CASE TYPE</label><select id="category" value={category} onChange={event => { setCategory(event.target.value); setError(null); }}>{['Detective mystery', 'Murder mystery', 'Theft', 'Missing person', 'Cybercrime', 'Secret or betrayal'].map(value => <option key={value}>{value}</option>)}</select></div><div><label htmlFor="difficulty">DIFFICULTY</label><select id="difficulty" value={difficulty} onChange={event => { setDifficulty(event.target.value); setError(null); }}>{['Easy', 'Medium', 'Hard'].map(value => <option key={value}>{value}</option>)}</select></div></div>
        <div className="form-row"><div><label htmlFor="count">PERSONS OF INTEREST</label><select id="count" value={count} onChange={event => { setCount(Number(event.target.value)); setError(null); }}>{[3, 4, 5].map(value => <option key={value} value={value}>{value} suspects</option>)}</select></div><label className="option-switch" htmlFor="red-herrings"><span><b>Red herrings</b><small>Misleading clues, fairly explained</small></span><input id="red-herrings" type="checkbox" checked={redHerrings} onChange={event => { setRedHerrings(event.target.checked); setError(null); }}/></label></div>
        <button className="button button-primary generate" disabled={scenario.trim().length < 30 || busy} onClick={submit}>{busy ? <><span className="spinner"/> Building the case…</> : <>Build my case <Sparkles size={15}/></>}</button>
        {error && <div className="generation-error" role="alert" aria-live="assertive"><b>{error.title}</b><span>{error.message}</span></div>}
        <div className="privacy-note"><LockKeyhole size={13}/> Your story stays yours. Every case is entirely fictional.</div>
      </div></section><aside className="brief-card"><div className="brief-icon"><Fingerprint size={19}/></div><span className="overline">THE CASEFILE METHOD</span><h3>Truth is in<br/>the details.</h3><p>Every investigation is built around one fixed solution. The evidence is yours to examine. The answer stays sealed until you make your call.</p><div className="brief-rule"/><div className="brief-step"><span>01</span><div><b>The room takes shape</b><small>People, places, and a question.</small></div></div><div className="brief-step"><span>02</span><div><b>Details begin to surface</b><small>Logs, statements, and loose ends.</small></div></div><div className="brief-step"><span>03</span><div><b>You make the call</b><small>The solution unlocks afterward.</small></div></div><div className="brief-confidential"><Shield size={14}/> SOLUTION SEALED UNTIL ACCUSATION</div></aside></div></main></div>;
}
