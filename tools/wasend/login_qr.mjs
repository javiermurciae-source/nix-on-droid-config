import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import qrcode from 'qrcode-terminal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Mac OS', 'Desktop', '14.4.1']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 CÓDIGO QR GENERADO:');
            qrcode.generate(qr, { small: true });
            try {
                const qrPath = '/data/data/com.termux.launcher.nix/files/home/storage/pictures/whatsapp_qr.png';
                execSync(`qrencode -o "${qrPath}" -s 10 "${qr}" 2>/dev/null || true`);
                console.log('🖼️ Imagen guardada en ~/storage/pictures/whatsapp_qr.png');
            } catch (e) {}
        }

        if (connection === 'open') {
            console.log('\n🎉 ¡WHATSAPP BUSINESS VINCULADO EXITOSAMENTE!');
            process.exit(0);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('Sesión cerrada.');
                process.exit(1);
            }
        }
    });
}

start();
