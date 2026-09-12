---
name: whatsapp-voice-tts
description: >-
  Generación, síntesis y despacho de notas de voz de audio PTT para WhatsApp
  y altavoz de Android en Nix-on-Droid usando gTTS/TTS, conversión Opus/OGG con ffmpeg
  y envío instantáneo con wasend o reproducción local con termux-tts-speak.
---

# WhatsApp Voice & Audio TTS Skill

Esta skill documenta el flujo completo para sintetizar audios de voz mediante IA/TTS, convertirlos a formatos compatibles con WhatsApp y despacharlos bajo demanda como notas de voz nativas (`PTT` - Push To Talk) o reproducirlos en el dispositivo.

---

## 1. Síntesis y Descarga de Voz TTS

`termux-tts-speak` reproduce directamente por el hardware de altavoces de Android. Cuando se requiere generar un archivo de audio reproducible para compartir:

* **Endpoint de Google TTS vía Python (rápido, sin dependencias pesadas)**:
  ```python
  import urllib.request, urllib.parse

  text = "Hola Camilo, soy Nix-on-Droid..."
  url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={urllib.parse.quote(text)}&tl=es&client=tw-ob"
  req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
  with urllib.request.urlopen(req) as resp, open('/data/data/com.termux.launcher.nix/files/home/storage/downloads/audio.mp3', 'wb') as f:
      f.write(resp.read())
  ```

---

## 2. Conversión a Formato Nota de Voz WhatsApp (`.ogg` / Opus)

WhatsApp requiere códec Opus empaquetado en contenedor OGG con sample rate de 48000Hz mono para desplegar el reproductor interactivo de nota de voz (ondas de audio verdes / PTT):

```bash
ffmpeg -y -i ~/storage/downloads/audio.mp3 -c:a libopus -b:a 32k -ar 48000 -ac 1 ~/storage/downloads/audio.ogg
```

---

## 3. Despacho Directo por WhatsApp (`wasend`)

`wasend` soporta nativamente el tipo de mensaje de audio PTT (Push To Talk):

* **Envío de nota de voz con mensaje explicativo**:
  ```bash
  wasend --to <numero_o_nombre_o_grupo> --file "$HOME/storage/downloads/audio.ogg" --caption "🤖 Mensaje de voz de Nix-on-Droid"
  ```
* **Comportamiento interno de `wasend`**:
  - Detecta extensiones `.ogg`, `.opus`, `.mp3`, `.m4a`, `.wav`.
  - Mapea el mimetype (`audio/ogg; codecs=opus`).
  - Envía el mensaje con `{ audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }`.
  - Si se proporcionó `--caption` o `--msg`, envía el texto explicativo inmediatamente después.

---

## 4. Reproducción Local por Altavoz (Notificación)

Para notificar al usuario en tiempo real en el teléfono:
```bash
termux-tts-speak -l es -r 1.05 "Camilo, ya generé tu mensaje de audio y te lo envié directamente a tu WhatsApp."
```
