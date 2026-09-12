import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Mac OS', 'Chrome', '124.0.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            const qrPath = '/data/data/com.termux.launcher.nix/files/home/storage/pictures/whatsapp_qr.png';
            await QRCode.toFile(qrPath, qr, { width: 600, margin: 2 });
            console.log('NUEVO_QR_LISTO');
            exec(`termux-open "${qrPath}"`);
        }

        if (connection === 'open') {
            console.log('🎉 ¡WHATSAPP VINCULADO CON ÉXITO!');
            exec(`termux-tts-speak -l es -r 1.05 "Camilo, WhatsApp Business vinculado exitosamente."`);
            process.exit(0);
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada, reconectando...', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 2000);
            }
        }
    });
}

connectToWhatsApp();
