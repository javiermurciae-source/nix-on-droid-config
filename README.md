# 📱 Nix-on-Droid Configuration (Android Environment)

Configuración declarativa de Nix para Termux / Nix-on-Droid en Android (`aarch64`), integrando herramientas de IA, desarrollo Android, reverse engineering y utilidades avanzadas.

![Terminal Screenshot](./screenshot.jpg)

---

## 🚀 Método de Instalación & Despliegue Rápido

### 1. Clonar el repositorio en tu configuración local:
```bash
git clone https://github.com/javiermurciae-source/nix-on-droid-config.git ~/.config/nix-on-droid
```

> *Si ya existía la carpeta `~/.config/nix-on-droid`, puedes respaldarla con `mv ~/.config/nix-on-droid ~/.config/nix-on-droid.bak` antes de clonar.*

### 2. Aplicar y compilar la configuración con Nix-on-Droid:
```bash
nix-on-droid switch --flake ~/.config/nix-on-droid
```

---

## 🛠️ Paquetes y Runtimes Integrados

### 🤖 Herramientas de IA & Asistentes
- **`agy`**: Google Antigravity CLI
- **`opencode`**: Opencode CLI
- **`cline`**: Cline terminal assistant
- **`kilo` / `kilocode`**: KiloCode AI
- **`keelcode`**: Keelcode Developer Assistant
- **`freebuff`**: Freebuff terminal tool
- **`mimo`**: Mimo Code AI

### ⚙️ Runtimes & Lenguajes
- **Node.js**
- **Bun**
- **Python 3** (con `requests`, `beautifulsoup4`, `html2text`, `frida-tools`)
- **Glibc** (Nix aarch64 linker)
- **JDK 17** & **Gradle**

### 🔍 Redes & Reconocimiento
- `nmap`, `tcpdump`, `tshark`, `whatweb`, `exploitdb`, `dnsutils`, `whois`

### 📱 Android & Reverse Engineering
- `android-tools` (adb/fastboot), `apksigner`, `radare2`, `frida-tools`

### 📄 Document Lab & Multimedia
- `typst`, `tectonic`, `pandoc`, `imagemagick`, `tesseract`, `yt-dlp`, `ffmpeg`, `aria2`, `miniserve`, `gh`

---

## 🔄 Actualizar el Sistema

Cada vez que agregues paquetes o modifiques [nix-on-droid.nix](./nix-on-droid.nix), ejecuta:

```bash
nix-on-droid switch --flake ~/.config/nix-on-droid
```
