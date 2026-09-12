import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";

const AUTH_DIR = path.join(process.env.HOME, ".config/nix-on-droid/tools/wasend/auth_info");
const jid = "573118337171@s.whatsapp.net";

const msg = `🤖 ¡Hola! Soy Nix-on-Droid, el agente autónomo de Camilo.
⚡ Mensaje automatizado: Camilo me ha solicitado hacerte entrega de tu servicio directamente por este medio.

✨ *DISNEY+ PREMIUM (7 ESPN)*
🚀 *Detalles de tu cuenta:*
📧 *Correo:* nicolaszone01@gmail.com
🔑 *Contraseña:* Stream_Zone**1
👤 *Perfil:* 7
🔒 *PIN:* 0007

💡 *Instrucciones y Recomendaciones:*
• Ingresa directamente a la app o web oficial de Disney+.
• Selecciona únicamente el perfil asignado (*Perfil 7*).
• No modifiques el nombre del perfil ni la clave general.

¡Que disfrutes al máximo tus eventos deportivos y contenido favorito! Si presentas alguna novedad, quedamos atentos.`;

async function main() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        syncFullHistory: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update;
        if (connection === "open") {
            console.log("Conectado a WhatsApp. Despachando mensaje con ACK...");
            try {
                const res = await sock.sendMessage(jid, { text: msg });
                console.log("Mensaje confirmado por WhatsApp ID:", res?.key?.id);
                setTimeout(() => {
                    sock.end();
                    process.exit(0);
                }, 5000);
            } catch (err) {
                console.error("Error al enviar mensaje:", err);
                process.exit(1);
            }
        }
    });
}

main();
