#!/usr/bin/env node

import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.tar': 'application/x-tar',
        '.gz': 'application/gzip',
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.vcf': 'text/vcard'
    };
    return map[ext] || 'application/octet-stream';
}

function resolveImageBuffer(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.svg') {
        const tmpPng = path.join('/tmp', `svg_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);
        try {
            execSync(`magick "${filePath}" "${tmpPng}" 2>/dev/null`);
            if (fs.existsSync(tmpPng)) {
                const buf = fs.readFileSync(tmpPng);
                fs.unlinkSync(tmpPng);
                return { buffer: buf, isImage: true };
            }
        } catch (e) {}
    }
    const isImage = IMAGE_EXTS.includes(ext);
    return { buffer: fs.readFileSync(filePath), isImage };
}

function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        to: null,
        msg: null,
        files: [],
        dir: null,
        caption: null,
        login: false,
        pairing: null,
        search: null,
        refresh: false
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--login') parsed.login = true;
        else if (args[i] === '--refresh') parsed.refresh = true;
        else if (args[i] === '--search') parsed.search = args[++i];
        else if (args[i] === '--pairing') parsed.pairing = args[++i];
        else if (args[i] === '--to') parsed.to = args[++i];
        else if (args[i] === '--msg') parsed.msg = args[++i];
        else if (args[i] === '--file') parsed.files.push(args[++i]);
        else if (args[i] === '--dir') parsed.dir = args[++i];
        else if (args[i] === '--caption') parsed.caption = args[++i];
    }
    return parsed;
}

const CACHE_DIR = path.join(process.env.HOME || '/data/data/com.termux.launcher.nix/files/home', '.cache');
const CONTACTS_CACHE = path.join(CACHE_DIR, 'contacts_cache.json');
const GROUPS_CACHE = path.join(CACHE_DIR, 'groups_cache.json');

const normalizeStr = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
const compactStr = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function stemWord(w) {
    if (!w || w.length < 4) return w;
    // Diminutivos comunes en español
    if (w.length > 5 && (w.endsWith('ito') || w.endsWith('ita') || w.endsWith('ico') || w.endsWith('ica'))) return w.slice(0, -3);
    // Plurales comunes
    if (w.length > 4 && (w.endsWith('os') || w.endsWith('as') || w.endsWith('es'))) return w.slice(0, -2);
    if (w.length > 3 && (w.endsWith('s') || w.endsWith('o') || w.endsWith('a'))) return w.slice(0, -1);
    return w;
}

function fuzzyFind(query, list, keyName = 'name') {
    if (!query || !list || !list.length) return null;
    const qNorm = normalizeStr(query);
    const qComp = compactStr(query);
    if (!qComp) return null;
    const qTokens = qNorm.split(' ').filter(Boolean);
    const qStems = qTokens.map(stemWord);

    let best = null;
    let maxScore = -1;

    for (const item of list) {
        const raw = item[keyName];
        if (!raw) continue;
        const iNorm = normalizeStr(raw);
        const iComp = compactStr(raw);

        // Coincidencia exacta estricta o compacta (máxima prioridad)
        if (iNorm === qNorm || iComp === qComp) {
            return item;
        }

        let score = 0;
        if (iNorm.startsWith(qNorm) || iComp.startsWith(qComp)) score += 120;
        else if (iNorm.includes(qNorm) || iComp.includes(qComp)) score += 80;
        else if (qComp.includes(iComp) && iComp.length >= 4) score += 60;

        // Coincidencia por tokens y raíces lematizadas
        const iTokens = iNorm.split(' ').filter(Boolean);
        const iStems = iTokens.map(stemWord);

        let tokenMatches = 0;
        for (let idx = 0; idx < qTokens.length; idx++) {
            const qt = qTokens[idx];
            const qs = qStems[idx];

            if (iTokens.includes(qt)) {
                tokenMatches += 2.0;
            } else if (iStems.includes(qs)) {
                tokenMatches += 1.8; // Coincidencia raíz (ej. mercado <-> mercadito)
            } else if (qt.length >= 3 && iTokens.some(it => it.startsWith(qt))) {
                tokenMatches += 1.2;
            } else if (qt.length >= 4 && iTokens.some(it => it.includes(qt))) {
                tokenMatches += 1.0;
            }
        }
        score += (tokenMatches / (qTokens.length || 1)) * 60;

        // Tolerancia a prefijos y subcadenas si la query es representativa
        if (qComp.length >= 4 && iComp.startsWith(qComp.slice(0, 4))) {
            score += 25;
        }

        if (score > maxScore && score >= 50) {
            maxScore = score;
            best = item;
        }
    }
    return best;
}

const FAST_TARGETS = {
    'stream zone oficial': '573114668309@s.whatsapp.net',
    'streamzone oficial': '573114668309@s.whatsapp.net',
    'stringsor oficial': '573114668309@s.whatsapp.net',
    'string son oficial': '573114668309@s.whatsapp.net',
    'stream son oficial': '573114668309@s.whatsapp.net',
    'stream son': '573114668309@s.whatsapp.net',
    'stream zone': '573114668309@s.whatsapp.net',
    'streamzone': '573114668309@s.whatsapp.net',
    'aleja': '573212159428@s.whatsapp.net',
    'guatemala': '50241028869@s.whatsapp.net',
    'black': '51905984023@s.whatsapp.net',
    'shadow': '573138188007@s.whatsapp.net',
    'distribuidores': '120363425211205411@g.us',
    'grupo distribuidores': '120363425211205411@g.us',
    'grupo stream zone': '120363425211205411@g.us',
    'distribuidores stream zone': '120363425211205411@g.us'
};

function formatJid(target) {
    if (!target) return null;
    let query = String(target).trim();
    if (query.endsWith('@g.us') || query.endsWith('@s.whatsapp.net')) return query;

    // Resolución VIP instantánea (0 ms)
    const lowTarget = normalizeStr(query);
    if (FAST_TARGETS[lowTarget]) {
        console.log(`⚡ Destino VIP resuelto al instante: "${query}" -> ${FAST_TARGETS[lowTarget]}`);
        return FAST_TARGETS[lowTarget];
    }
    for (const [alias, jid] of Object.entries(FAST_TARGETS)) {
        if (lowTarget === alias || lowTarget.includes(alias) || alias.includes(lowTarget)) {
            console.log(`⚡ Destino VIP resuelto por alias: "${query}" -> ${jid}`);
            return jid;
        }
    }

    const cleanDigits = query.replace(/[^0-9]/g, '');
    if (cleanDigits.length >= 7 && cleanDigits.length <= 15 && (/^[0-9+ ]+$/.test(query) || !/[a-zA-Z]/.test(query))) {
        return `${cleanDigits}@s.whatsapp.net`;
    }

    // 1. Buscar en grupos de WhatsApp (con ranking y tolerancia a tildes/emojis)
    if (fs.existsSync(GROUPS_CACHE)) {
        try {
            const groups = JSON.parse(fs.readFileSync(GROUPS_CACHE, 'utf-8'));
            const match = fuzzyFind(query, groups, 'name');
            if (match && match.jid) {
                console.log(`👥 Grupo resuelto: "${match.name}" -> ${match.jid}`);
                return match.jid;
            }
        } catch (e) {}
    }

    // 2. Buscar en libreta de contactos (con ranking y tolerancia a tildes)
    if (fs.existsSync(CONTACTS_CACHE)) {
        try {
            const contacts = JSON.parse(fs.readFileSync(CONTACTS_CACHE, 'utf-8'));
            const match = fuzzyFind(query, contacts, 'name');
            if (match && match.number) {
                const num = match.number.replace(/[^0-9]/g, '');
                if (num) {
                    console.log(`👤 Contacto resuelto: "${match.name}" -> ${num}`);
                    return `${num}@s.whatsapp.net`;
                }
            }
        } catch (e) {}
    }

    // 3. Fallback en vivo con termux-contact-list si no se encontró en caché
    try {
        const json = execSync('termux-contact-list 2>/dev/null', { encoding: 'utf-8' });
        const list = JSON.parse(json);
        fs.writeFileSync(CONTACTS_CACHE, JSON.stringify(list, null, 2));
        const match = fuzzyFind(query, list, 'name');
        if (match && match.number) {
            const num = match.number.replace(/[^0-9]/g, '');
            if (num) {
                console.log(`👤 Contacto resuelto (en vivo): "${match.name}" -> ${num}`);
                return `${num}@s.whatsapp.net`;
            }
        }
    } catch (e) {}

    // Fallback numérico por defecto
    return `${cleanDigits}@s.whatsapp.net`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function start() {
    const args = parseArgs();

    // 1. Refrescar libreta de contactos bajo demanda
    if (args.refresh) {
        try {
            console.log('🔄 Actualizando caché de contactos desde Android...');
            const json = execSync('termux-contact-list 2>/dev/null', { encoding: 'utf-8' });
            const list = JSON.parse(json);
            fs.writeFileSync(CONTACTS_CACHE, JSON.stringify(list, null, 2));
            console.log(`✅ ${list.length} contactos indexados en caché.`);
        } catch (e) {
            console.error('Error al actualizar contactos:', e.message);
        }
        if (!args.search && !args.to && !args.login) process.exit(0);
    }

    // 2. Búsqueda instantánea de contactos o grupos (< 5 ms)
    if (args.search) {
        const q = args.search;
        console.log(`\n🔍 Buscando "${q}" en contactos y grupos...`);
        let totalFound = 0;

        if (fs.existsSync(GROUPS_CACHE)) {
            try {
                const groups = JSON.parse(fs.readFileSync(GROUPS_CACHE, 'utf-8'));
                const matchedGroups = groups.filter(g => fuzzyFind(q, [g], 'name'));
                if (matchedGroups.length > 0) {
                    console.log(`\n👥 Grupos encontrados (${matchedGroups.length}):`);
                    matchedGroups.forEach(g => console.log(`  • \x1b[1;36m${g.name}\x1b[0m\n    ID: ${g.jid}`));
                    totalFound += matchedGroups.length;
                }
            } catch (e) {}
        }

        if (fs.existsSync(CONTACTS_CACHE)) {
            try {
                const contacts = JSON.parse(fs.readFileSync(CONTACTS_CACHE, 'utf-8'));
                const matchedContacts = contacts.filter(c => fuzzyFind(q, [c], 'name'));
                if (matchedContacts.length > 0) {
                    console.log(`\n👤 Contactos encontrados (${matchedContacts.length}):`);
                    matchedContacts.forEach(c => console.log(`  • \x1b[1;32m${c.name}\x1b[0m\n    Tel: ${c.number || 'Sin número'}`));
                    totalFound += matchedContacts.length;
                }
            } catch (e) {}
        }

        if (totalFound === 0) {
            console.log(`❌ No se encontraron coincidencias para "${q}".`);
        }
        process.exit(0);
    }

    if (!args.login && !args.to) {
        console.log(`
Uso de wasend (Herramienta CLI bajo demanda de WhatsApp):
  wasend --search "nombre/grupo"          -> Búsqueda instantánea de contactos y grupos (< 5ms)
  wasend --refresh                        -> Refresca la caché local de contactos de Android
  wasend --login                          -> Inicia sesión escaneando QR en terminal
  wasend --login --pairing 57300...       -> Inicia sesión con código de emparejamiento
  wasend --to 57300... --msg "Hola"       -> Envía un mensaje y se desconecta
  wasend --to 57300... --file /img.jpg [--caption "Texto"] -> Envía un archivo/foto con texto
  wasend --to 57300... --file f1.jpg --file f2.jpg --msg "Reporte final" -> Envía lote y luego el texto
  wasend --to 57300... --dir /ruta/fotos/ --msg "Reporte final" -> Envía todas las fotos y luego el reporte
        `);
        process.exit(0);
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Chrome (Linux)', 'Chrome', '124.0.0.0'],
        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: false,
        keepAliveIntervalMs: 20000,
        connectTimeoutMs: 15000,
        defaultQueryTimeoutMs: 15000
    });

    sock.ev.on('creds.update', saveCreds);

    let codeRequested = false;
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !args.pairing) {
            console.log("\n📱 Escanea este código QR con tu WhatsApp Business (Dispositivos vinculados):\n");
            qrcode.generate(qr, { small: true });
            try {
                const qrPath = '/data/data/com.termux.launcher.nix/files/home/storage/pictures/whatsapp_qr.png';
                execSync(`qrencode -o "${qrPath}" -s 10 "${qr}" 2>/dev/null || true`);
            } catch (e) {}
        }

        if (args.pairing && !sock.authState.creds.registered && !codeRequested) {
            codeRequested = true;
            setTimeout(async () => {
                try {
                    const cleanPhone = args.pairing.replace(/[^0-9]/g, '');
                    const code = await sock.requestPairingCode(cleanPhone);
                    console.log(`\n🔑 Tu código de vinculación de WhatsApp es: \x1b[1;32m${code}\x1b[0m\n`);
                    try {
                        import('child_process').then(cp => {
                            cp.execSync(`termux-clipboard-set "${code}" 2>/dev/null || true`);
                            cp.execSync(`echo -n "${code}" | kitten clipboard 2>/dev/null || true`);
                        });
                    } catch (e) {}
                } catch (err) {
                    console.error("Error al solicitar código de vinculación:", err.message);
                }
            }, 3000);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            if (isLoggedOut) {
                console.log('Sesión cerrada o desvinculada.');
                process.exit(1);
            } else if (args.login) {
                // Reintentar reconexión automática si se cerró por handshake
                console.log('Reconectando...');
                main();
            }
        } else if (connection === 'open') {
            if (args.login) {
                console.log('✅ ¡Sesión vinculada exitosamente con WhatsApp!');
                setTimeout(() => process.exit(0), 1500);
                return;
            }

            // Actualizar silenciosamente la lista de grupos en caché en segundo plano
            sock.groupFetchAllParticipating().then(participating => {
                const groupList = Object.values(participating).map(g => ({
                    jid: g.id,
                    name: g.subject || 'Sin nombre'
                }));
                if (groupList.length > 0) {
                    fs.writeFileSync(GROUPS_CACHE, JSON.stringify(groupList, null, 2));
                }
            }).catch(() => {});

            const jid = formatJid(args.to);
            let fileList = [...args.files];

            if (args.dir) {
                const resolvedDir = path.resolve(args.dir);
                if (fs.existsSync(resolvedDir) && fs.statSync(resolvedDir).isDirectory()) {
                    const dirFiles = fs.readdirSync(resolvedDir)
                        .filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
                        .map(f => path.join(resolvedDir, f));
                    fileList.push(...dirFiles);
                } else {
                    console.error(`Error: El directorio no existe: ${resolvedDir}`);
                }
            }

            try {
                if (fileList.length === 1 && (args.caption || args.msg)) {
                    // Caso 1: Una sola imagen -> se envía con el texto como caption en un solo mensaje
                    const filePath = path.resolve(fileList[0]);
                    const ext = path.extname(filePath).toLowerCase();
                    const { buffer, isImage } = resolveImageBuffer(filePath);
                    const caption = args.caption || args.msg;

                    if (isImage) {
                        await sock.sendMessage(jid, { image: buffer, caption });
                    } else if (['.mp4', '.mkv'].includes(ext)) {
                        await sock.sendMessage(jid, { video: buffer, caption });
                    } else if (['.ogg', '.opus', '.mp3', '.m4a', '.wav'].includes(ext)) {
                        const mime = ext === '.ogg' || ext === '.opus' ? 'audio/ogg; codecs=opus' : (ext === '.mp3' ? 'audio/mpeg' : 'audio/mp4');
                        await sock.sendMessage(jid, { audio: buffer, mimetype: mime, ptt: true });
                        if (caption) {
                            await sleep(500);
                            await sock.sendMessage(jid, { text: caption });
                        }
                    } else {
                        await sock.sendMessage(jid, { document: buffer, fileName: path.basename(filePath), mimetype: getMimeType(filePath), caption });
                    }
                    console.log(`✅ Archivo único enviado con caption a ${args.to}`);
                } else if (fileList.length > 0) {
                    // Caso 2: Múltiples imágenes / archivos -> se envía el paquete primero y luego el texto explicativo
                    console.log(`📦 Enviando paquete de ${fileList.length} archivos a ${args.to}...`);
                    for (let i = 0; i < fileList.length; i++) {
                        const filePath = path.resolve(fileList[i]);
                        if (!fs.existsSync(filePath)) continue;

                        const ext = path.extname(filePath).toLowerCase();
                        const { buffer, isImage } = resolveImageBuffer(filePath);

                        if (isImage) {
                            await sock.sendMessage(jid, { image: buffer });
                        } else if (['.mp4', '.mkv'].includes(ext)) {
                            await sock.sendMessage(jid, { video: buffer });
                        } else if (['.ogg', '.opus', '.mp3', '.m4a', '.wav'].includes(ext)) {
                            const mime = ext === '.ogg' || ext === '.opus' ? 'audio/ogg; codecs=opus' : (ext === '.mp3' ? 'audio/mpeg' : 'audio/mp4');
                            await sock.sendMessage(jid, { audio: buffer, mimetype: mime, ptt: true });
                        } else {
                            await sock.sendMessage(jid, { document: buffer, fileName: path.basename(filePath), mimetype: getMimeType(filePath) });
                        }
                        console.log(`  [${i + 1}/${fileList.length}] ${path.basename(filePath)} enviado`);
                        await sleep(500); // Breve pausa para no saturar el websocket
                    }

                    // Después de enviar todas las fotos, enviamos el reporte / texto formateado
                    const finalMsg = args.msg || args.caption;
                    if (finalMsg) {
                        await sleep(1000);
                        await sock.sendMessage(jid, { text: finalMsg });
                        console.log(`📝 Reporte explicativo final enviado a ${args.to}`);
                    }
                    console.log(`✅ Paquete completo enviado exitosamente.`);
                } else if (args.msg) {
                    // Caso 3: Solo mensaje de texto
                    const sendRes = await sock.sendMessage(jid, { text: args.msg });
                    console.log(`✅ Mensaje despachado a ${args.to} (ID: ${sendRes?.key?.id || 'OK'})`);
                }
            } catch (err) {
                console.error("Error al enviar:", err);
                process.exit(1);
            }

            // Pausa obligatoria para permitir que Baileys complete el prekey exchange y envíe los frames al servidor
            await sleep(4000);
            try { sock.end(); } catch(e) {}
            process.exit(0);
        }
    });
}

start().catch(err => {
    console.error("Fallo inesperado:", err);
    process.exit(1);
});
