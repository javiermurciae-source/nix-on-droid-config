import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('creds.update', saveCreds);

    let opened = false;
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            const qrPath = '/data/data/com.termux.launcher.nix/files/home/storage/pictures/whatsapp_qr.png';
            await QRCode.toFile(qrPath, qr, { width: 600, margin: 2 });
            console.log('QR_READY');
            if (!opened) {
                opened = true;
                exec(`viewpic "${qrPath}"`);
            }
        }

        if (connection === 'open') {
            console.log('🎉 ¡WHATSAPP CONECTADO!');
            exec(`termux-tts-speak -l es -r 1.05 "¡Excelente Camilo! WhatsApp vinculado con éxito."`);
            process.exit(0);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('Logged out');
                process.exit(1);
            }
        }
    });
}

start();
