import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(`📡 Conectando con versión oficial WhatsApp Web: ${version.join('.')}`);

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '120.0.0.0'],
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    let pairingRequested = false;

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            console.log('\n🎉 ¡WHATSAPP BUSINESS VINCULADO CON ÉXITO!');
            process.exit(0);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                console.log('Reanudando conexión...');
                start();
            } else {
                console.log('Sesión cerrada.');
                process.exit(1);
            }
        }
    });

    setTimeout(async () => {
        if (!sock.authState.creds.registered && !pairingRequested) {
            pairingRequested = true;
            try {
                const phone = '573197035439';
                const code = await sock.requestPairingCode(phone);
                console.log(`\n======================================================`);
                console.log(` 🔑 CÓDIGO DE VINCULACIÓN: \x1b[1;32m${code}\x1b[0m`);
                console.log(`======================================================\n`);
                try {
                    execSync(`termux-clipboard-set "${code}" 2>/dev/null || true`);
                    execSync(`echo -n "${code}" | kitten clipboard 2>/dev/null || true`);
                } catch (e) {}
            } catch (err) {
                console.error('Error al pedir código:', err.message);
            }
        }
    }, 4500);
}

start();
