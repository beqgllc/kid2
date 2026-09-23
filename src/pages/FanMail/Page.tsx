import { FormEvent, useState } from 'react';
import { usePageMeta } from '../../lib/seo';
import { sendFanMail } from '../../services/fanMail';

export function FanMail() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState('sending');
    setError('');
    try {
      await sendFanMail(name, email, message);
      setState('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Unable to send.');
    }
  };

  usePageMeta({
    title: 'Fan Mail — ATTIKID',
    description: 'Send a message to ATTIKID and join the conversation around the music.',
    canonical: 'https://attikid.vercel.app/fan-mail',
    type: 'website',
    keywords: ['ATTIKID fan mail', 'contact', 'message'],
    image: '/images/hero/attikid-hero.webp',
  });

  return (
    <div className="page fanmail-page">
      <header className="catalog-hero">
        <div>
          <span className="portfolio-label">CONTACT / FAN MAIL</span>
          <h1>Say something.</h1>
          <p>No press form. No corporate inbox. Just a place to send a real message.</p>
        </div>
      </header>

      <section className="fanmail-layout">
        <aside className="fanmail-note">
          <span className="portfolio-label">THE OPEN DOOR</span>
          <p>Tell me what a song meant to you, what you hated, what you want to hear next, or just say what&apos;s on your mind.</p>
          <small>Messages go through the ATTIKID fan-mail system.</small>
        </aside>

        <form className="fanmail-form" onSubmit={submit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} />
          </label>
          <label>
            Message
            <textarea required value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} />
          </label>
          <div className="fanmail-submit">
            <button className="button" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Send message →'}
            </button>
            {state === 'success' && <p className="form-success">Message received. Thanks for reaching out.</p>}
            {state === 'error' && <p className="form-error">{error}</p>}
          </div>
        </form>
      </section>
    </div>
  );
}
