import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Chrome (Linux)', 'Chrome', '124.0.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    let qrCount = 0;
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCount++;
            const qrPath = '/data/data/com.termux.launcher.nix/files/home/storage/pictures/whatsapp_qr.png';
            await QRCode.toFile(qrPath, qr, { width: 650, margin: 3 });
            console.log(`QR_ACTUALIZADO_${qrCount}`);
            exec(`termux-open "${qrPath}"`);
        }

        if (connection === 'open') {
            console.log('CONECTADO_EXITOSAMENTE');
            exec(`termux-tts-speak -l es -r 1.05 "¡Listo Camilo! WhatsApp vinculado correctamente."`);
            process.exit(0);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('LOGGED_OUT');
                process.exit(1);
            } else {
                console.log('RECONECTANDO...');
                setTimeout(connect, 1500);
            }
        }
    });
}

connect();
