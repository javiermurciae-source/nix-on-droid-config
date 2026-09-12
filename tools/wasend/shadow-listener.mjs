#!/usr/bin/env node
// Shadow Listener v3: modo escucha con respuestas dinámicas.
// Ejecución: cd ~/.config/nix-on-droid/tools/wasend && node /data/data/com.termux.launcher.nix/files/home/.tmp/shadow-listener.mjs
import makeWASocket from '@whiskeysockets/baileys';
import { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';

const SHADOW_JID = '573138188007@s.whatsapp.net';
const LISTEN_AUTH = path.join(process.env.HOME || '/data/data/com.termux.launcher.nix/files/home', '.tmp/listen-auth');
const logger = pino({ level: 'silent' });

const { state, saveCreds } = await useMultiFileAuthState(LISTEN_AUTH);

const sock = makeWASocket({
  logger,
  auth: state,
  printQRInTerminal: false,
  browser: ['Nix-on-Droid', 'Chrome', '2026.09'],
});

sock.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode;
    console.log(`[LISTENER] Conexión cerrada (${code}), reiniciando...`);
    if (code === DisconnectReason.loggedOut) {
      console.error('[LISTENER] Logged out');
      process.exit(1);
    }
    setTimeout(() => process.exit(1), 5000);
  }
  if (connection === 'open') {
    console.log('[LISTENER] ✅ Conectado y escuchando a Shadow');
  }
});

sock.ev.on('creds.update', saveCreds);

function dynamicResponse(text) {
  const lower = text.toLowerCase();
  const name = (lower.match(/shadow|shad/i) || [])[0] || 'Shadow';
  const bots = ['bot feo', 'robotito', 'máquina', 'programa', 'script'];
  const bot = bots[Math.floor(Math.random() * bots.length)];
  const insults = [
    `Jajajaja qué feo ese ${bot} 😂 parece sacado de Windows 98`,
    `Ese ${bot} tiene más bugs que código XD 💀`,
    `JAJA no manes qué ${bot} tan feo 😭😭 parece un Mario Bros del 2000`,
    `Hermoso ese ${bot} 🤡👏 parece un PowerPoint animado de primaria`,
    `Bro eso no es ${bot} es un meme viejo 😂💀`,
    `Jajajajá qué feo 😂 ese ${bot} parece de Windows 98`,
    `No manes qué ${bot} más feo 😂 parece un dibujo con Paint`,
    `JAJA ese ${bot} tiene más estilo que una pizarra de 1999 💀`,
    `Qué lindo ${bot} 😂 parece que lo programó un perro 🐕`,
    `Jajajajajá no manes qué ${bot} 😂💀 ese ${bot} es historia`,
    `Jajaja ${name} con su ${bot} otra vez 😂💀`,
    `No manes ${name} qué ${bot} tan cutre 😂😂`,
    `Ese ${bot} parece hecho con tijeras y pegamento 😂👏`,
    `JAJA ${name} y su ${bot} feo XD 💀💀`,
    `Qué lindo ${name} con su ${bot} viejo 😂🔥`,
  ];
  return insults[Math.floor(Math.random() * insults.length)];
}

const DELAYS = [2, 4, 6, 3, 5];

sock.ev.on('messages.upsert', async (m) => {
  const msgs = m.messages;
  if (!msgs || !msgs.length) return;

  for (const msg of msgs) {
    if (!msg.message || msg.key.fromMe) continue;
    const sender = msg.key.participant || msg.key.remoteJid;
    if (sender !== SHADOW_JID) continue;

    let text = '';
    try {
      text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    } catch {}
    if (!text.trim()) continue;

    if (msg.key.remoteJid === 'status@broadcast') continue;

    console.log(`[SHADOW] "${text}"`);
    const delay = DELAYS[Math.floor(Math.random() * DELAYS.length)] * 1000;
    setTimeout(async () => {
      const response = dynamicResponse(text);
      try {
        await sock.sendMessage(sender, { text: response }, { quoted: msg });
        console.log(`[RESP] "${response}"`);
      } catch (e) {
        console.error('[ERR]', e.message);
      }
    }, delay);
  }
});

console.log('🟢 Shadow listener v3 activo');
console.log('📡 Escuchando mensajes de Shadow con respuestas dinámicas...');
