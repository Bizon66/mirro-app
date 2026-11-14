// Feedback from the app's Profile → a GitHub issue in the owner's private repository.
// Needs the Vercel environment variable FEEDBACK_GITHUB_TOKEN (fine-grained token, this repository only,
// permission "Issues: Read and write"). Optional: FEEDBACK_REPO (default Bizon66/mirro-app).
// Nothing about the person's weight, food or measurements is sent: only what they typed, plus the app version,
// interface language and screen / browser line if they left that box ticked.
// Copyright (c) 2026 the app's author. All rights reserved.
'use strict';

const APP_ORIGINS = new Set(['capacitor://localhost', 'https://localhost', 'http://localhost']);
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, n).trim();

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (APP_ORIGINS.has(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'body' });
  if (body.hp) return res.status(200).json({ ok: true });   // honeypot field filled → a bot; pretend it worked

  const text = clip(body.text, 2000), kind = ['idea', 'bug', 'other'].includes(body.kind) ? body.kind : 'other';
  if (text.length < 3) return res.status(400).json({ ok: false, error: 'short' });
  const token = process.env.FEEDBACK_GITHUB_TOKEN;
  if (!token) return res.status(503).json({ ok: false, error: 'not-configured' });
  const repo = process.env.FEEDBACK_REPO || 'Bizon66/mirro-app';

  const tech = body.tech && typeof body.tech === 'object'
    ? ['ver', 'lang', 'screen', 'ua', 'tab'].map(k => body.tech[k] ? `- ${k}: ${clip(body.tech[k], 200)}` : '').filter(Boolean).join('\n')
    : '';
  const label = { idea: '💡 Ідея', bug: '🐞 Помилка', other: '💬 Відгук' }[kind];
  const issue = {
    title: `${label}: ${text.replace(/\s+/g, ' ').replace(/@/g, '@\u200b').slice(0, 60)}${text.length > 60 ? '…' : ''}`,
    body: `${text.replace(/@/g, '@​')}\n\n---\n${tech || '_технічні дані не надіслано_'}\n\n_Надіслано з Mirro (форма «Відгук»)._`,
    labels: ['feedback', kind],
  };
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'mirro-feedback', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify(issue),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'github-' + r.status });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'network' });
  }
};
