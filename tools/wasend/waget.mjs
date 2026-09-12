#!/usr/bin/env node

import { makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } from '@whiskeysockets/baileys';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_info');

function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        from: null,
        limit: 5,
        type: 'image',
        out: path.join(process.env.HOME || '.', 'storage/downloads/wa_downloads'),
        view: true
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--from') parsed.from = args[++i];
        else if (args[i] === '--limit') parsed.limit = parseInt(args[++i], 10) || 5;
        else if (args[i] === '--type') parsed.type = args[++i];
        else if (args[i] === '--out') parsed.out = args[++i];
        else if (args[i] === '--no-view') parsed.view = false;
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
    if (w.length > 5 && (w.endsWith('ito') || w.endsWith('ita') || w.endsWith('ico') || w.endsWith('ica'))) return w.slice(0, -3);
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

        if (iNorm === qNorm || iComp === qComp) return item;

        let score = 0;
        if (iNorm.startsWith(qNorm) || iComp.startsWith(qComp)) score += 120;
        else if (iNorm.includes(qNorm) || iComp.includes(qComp)) score += 80;
        else if (qComp.includes(iComp) && iComp.length >= 4) score += 60;

        const iTokens = iNorm.split(' ').filter(Boolean);
        const iStems = iTokens.map(stemWord);

        let tokenMatches = 0;
        for (let idx = 0; idx < qTokens.length; idx++) {
            const qt = qTokens[idx];
            const qs = qStems[idx];

            if (iTokens.includes(qt)) {
                tokenMatches += 2.0;
            } else if (iStems.includes(qs)) {
                tokenMatches += 1.8;
            } else if (qt.length >= 3 && iTokens.some(it => it.startsWith(qt))) {
                tokenMatches += 1.2;
            } else if (qt.length >= 4 && iTokens.some(it => it.includes(qt))) {
                tokenMatches += 1.0;
            }
        }
        score += (tokenMatches / (qTokens.length || 1)) * 60;

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
    'aleja': '573212159428@s.whatsapp.net',
    'guatemala': '50241028869@s.whatsapp.net',
    'black': '51905984023@s.whatsapp.net',
    'shadow': '51905984023@s.whatsapp.net',
    'distribuidores': '120363425211205411@g.us',
    'grupo distribuidores': '120363425211205411@g.us',
    'grupo stream zone': '120363425211205411@g.us',
    'distribuidores stream zone': '120363425211205411@g.us'
};

function resolveTargetJid(query) {
    if (!query) return null;
    const str = String(query).trim();
    if (str.endsWith('@g.us') || str.endsWith('@s.whatsapp.net')) return str;

    const lowTarget = normalizeStr(str);
    if (FAST_TARGETS[lowTarget]) {
        console.log(`⚡ Destino VIP resuelto al instante: "${str}" -> ${FAST_TARGETS[lowTarget]}`);
        return FAST_TARGETS[lowTarget];
    }
    for (const [alias, jid] of Object.entries(FAST_TARGETS)) {
        if (lowTarget === alias || lowTarget.includes(alias) || alias.includes(lowTarget)) {
            console.log(`⚡ Destino VIP resuelto por alias: "${str}" -> ${jid}`);
            return jid;
        }
    }

    const cleanDigits = str.replace(/[^0-9]/g, '');
    if (cleanDigits.length >= 7 && cleanDigits.length <= 15 && (/^[0-9+ ]+$/.test(str) || !/[a-zA-Z]/.test(str))) {
        return `${cleanDigits}@s.whatsapp.net`;
    }

    // 1. Grupos
    if (fs.existsSync(GROUPS_CACHE)) {
        try {
            const groups = JSON.parse(fs.readFileSync(GROUPS_CACHE, 'utf-8'));
            const match = fuzzyFind(str, groups, 'name');
            if (match && match.jid) {
                console.log(`👥 Grupo resuelto: "${match.name}" -> ${match.jid}`);
                return match.jid;
            }
        } catch (e) {}
    }

    // 2. Contactos en caché
    if (fs.existsSync(CONTACTS_CACHE)) {
        try {
            const contacts = JSON.parse(fs.readFileSync(CONTACTS_CACHE, 'utf-8'));
            const match = fuzzyFind(str, contacts, 'name');
            if (match && match.number) {
                const num = match.number.replace(/[^0-9]/g, '');
                if (num) {
                    console.log(`👤 Contacto resuelto: "${match.name}" -> ${num}`);
                    return `${num}@s.whatsapp.net`;
                }
            }
        } catch (e) {}
    }

    // 3. Fallback termux-contact-list
    try {
        const json = execSync('termux-contact-list 2>/dev/null', { encoding: 'utf-8' });
        const list = JSON.parse(json);
        fs.writeFileSync(CONTACTS_CACHE, JSON.stringify(list, null, 2));
        const match = fuzzyFind(str, list, 'name');
        if (match && match.number) {
            const num = match.number.replace(/[^0-9]/g, '');
            if (num) {
                console.log(`👤 Contacto resuelto (en vivo): "${match.name}" -> ${num}`);
                return `${num}@s.whatsapp.net`;
            }
        }
    } catch (e) {}

    return cleanDigits ? `${cleanDigits}@s.whatsapp.net` : null;
}

async function start() {
    const args = parseArgs();

    if (!args.from) {
        console.log(`
Uso de waget (Descarga multimedia bajo demanda con Baileys):
  waget --from 57321... [--limit 5] [--out ~/storage/downloads/fotos/]
  waget --from "Aleja" [--limit 5] [--out ~/storage/downloads/fotos/]
        `);
        process.exit(0);
    }

    const jid = resolveTargetJid(args.from);
    if (!jid) {
        console.error(`Error: No se pudo resolver el contacto o grupo: ${args.from}`);
        process.exit(1);
    }
    const outDir = path.resolve(args.out);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    if (!fs.existsSync(AUTH_DIR)) {
        console.error("Error: No se encontró sesión vinculada. Primero ejecuta 'wasend --login'.");
        process.exit(1);
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (!shouldReconnect) {
                console.log('Sesión cerrada o desvinculada.');
                process.exit(1);
            }
        } else if (connection === 'open') {
            console.log(`🔍 Conectado a WhatsApp. Buscando historial multimedia de ${args.from} (${jid})...`);

            try {
                console.log(`📥 Carpeta destino: ${outDir}`);
                console.log(`✅ Conexión con los servidores de WhatsApp completada.`);
                
                // Si WhatsApp almacena o mapea el chat bajo LID (dispositivos vinculados / privacidad moderna)
                // Intentar HistorySyncOnDemandRequest si se pasa key, o resolver fotos locales del contacto
                try {
                    const findScript = `python3 -c '
import sqlite3, os, subprocess, shutil
db = "/data/data/com.whatsapp/databases/msgstore.db"
tmp = "/data/data/com.termux.launcher.nix/files/home/.cache/waget_db.db"
os.system(f"$HOME/bin/rish -c \\"cp {db} {tmp} && chmod 666 {tmp}\\"")
if os.path.exists(tmp):
    conn = sqlite3.connect(tmp)
    c = conn.cursor()
    # Buscar chats por JID o LID
    c.execute("SELECT j1.raw_string, j2.raw_string FROM jid_map jm JOIN jid j1 ON jm.jid_row_id = j1._id JOIN jid j2 ON jm.lid_row_id = j2._id WHERE j1.raw_string LIKE \\"%${resolvedNumber}%\\";")
    mapping = c.fetchall()
    target_jids = ["%${resolvedNumber}%"]
    for m in mapping:
        target_jids.append(m[1])
    
    placeholders = " OR ".join(["j.raw_string LIKE ?" for _ in target_jids])
    query = f"""
        SELECT mm.file_path, m.timestamp
        FROM message m
        JOIN chat ch ON m.chat_row_id = ch._id
        JOIN jid j ON ch.jid_row_id = j._id
        LEFT JOIN message_media mm ON m._id = mm.message_row_id
        WHERE ({placeholders}) AND m.message_type = 1 AND mm.file_path IS NOT NULL
        ORDER BY m.timestamp DESC
        LIMIT ${args.limit}
    """
    c.execute(query, tuple(target_jids))
    files = c.fetchall()
    conn.close()
    for f in files:
        print(f[0])
'`;
                    const res = execSync(findScript, { encoding: 'utf-8' }).trim();
                    const photos = res.split('\n').filter(Boolean);
                    if (photos.length > 0) {
                        console.log(`📸 Se encontraron ${photos.length} fotos en el historial:`);
                        let lastSaved = null;
                        for (const relPath of photos) {
                            const fullSrc = `/data/media/0/Android/media/com.whatsapp/WhatsApp/${relPath}`;
                            const baseName = path.basename(relPath);
                            const dest = path.join(outDir, baseName);
                            execSync(`$HOME/bin/rish -c "cp '${fullSrc}' '${dest}' && chmod 644 '${dest}'"`);
                            console.log(`  ✅ Guardada: ${dest}`);
                            if (!lastSaved) lastSaved = dest;
                        }
                        if (args.view && lastSaved) {
                            console.log(`🖼️ Visualizando la más reciente con viewpic...`);
                            execSync(`~/bin/viewpic "${lastSaved}"`);
                        }
                    } else {
                        console.log("ℹ️ No se encontraron fotos históricas para este contacto.");
                    }
                } catch (dbErr) {
                    console.error("Detalle al leer historial local:", dbErr.message);
                }
            } catch (err) {
                console.error("Error al obtener mensajes:", err.message);
            }

            setTimeout(() => {
                process.exit(0);
            }, 1000);
        }
    });
}

start().catch(err => {
    console.error("Fallo inesperado:", err);
    process.exit(1);
});
