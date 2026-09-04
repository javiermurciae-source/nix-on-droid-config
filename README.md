# 📱 Nix-on-Droid Configuration (Android Environment)

Configuración declarativa de Nix para Termux / Nix-on-Droid en Android (`aarch64`), integrando herramientas de IA, desarrollo Android, reverse engineering y utilidades avanzadas.

![Terminal Screenshot](./screenshot.png?raw=true)

---

## 🚀 Método de Instalación & Despliegue Rápido

### 1. Clonar el repositorio en tu configuración local:
```bash
git clone https://github.com/javiermurciae-source/nix-on-droid-config.git ~/.config/nix-on-droid
```

> *Si ya existía la carpeta `~/.config/nix-on-droid`, puedes respaldarla con `mv ~/.config/nix-on-droid ~/.config/nix-on-droid.bak` antes de clonar.*

### 2. Aplicar y compilar la configuración (Sistema + Home Manager + Dotfiles):
```bash
nix-on-droid switch --flake ~/.config/nix-on-droid
```

### 3. Instalar herramientas de IA (NPM global):
```bash
bash ~/install-ai-tools.sh
```

---

## 🏗️ Arquitectura Modular (Nix-on-Droid + Home Manager)

- **`nix-on-droid.nix`**: Configuración del sistema, zona horaria (`America/Bogota`), shell Fish por defecto y paquetes base.
- **`home.nix`**: Módulo de usuario gobernado por Home Manager que gestiona dotfiles (`.config/fastfetch`, `.config/yazi`, `.config/fish`), scripts y wrappers ejecutables en `$HOME/bin`.
- **`dotfiles/`**: Configuraciones XDG limpias y declarativas.
- **`bin/`**: Wrappers de enlace dinámico glibc para herramientas de IA y accesos root/ADB Shizuku (`rish`, `su`, `sudo`).
- **`scripts/`**: Utilidades (`horario.sh`, `verificar-cod.sh`, `install-ai-tools.sh`).

---

## 🛠️ Paquetes y Runtimes Integrados

### 🤖 Herramientas de IA & Asistentes
- **`opencode`**: Opencode CLI (v1.15.10) — **Nativo oficial en Nixpkgs** (`pkgs.opencode`)
- **`agy`**: Google Antigravity CLI (v1.1.25) — Wrapper glibc con directiva de permisos
- **`cline`**: Cline terminal assistant — Wrapper glibc
- **`keelcode`**: Keelcode Developer Assistant (v0.2.0) — Wrapper glibc
- **`freebuff`**: Freebuff terminal tool (v0.0.167) — Wrapper glibc

### ⚙️ Runtimes & Lenguajes
- **Node.js**
- **Bun**
- **Python 3** (con `requests`, `beautifulsoup4`, `html2text`, `frida-tools`)
- **Glibc** (Nix aarch64 linker)
- **JDK 17** & **Gradle**

### 🔍 Redes & Reconocimiento
- `nmap`, `tcpdump`, `tshark`, `whatweb`, `exploitdb`, `dnsutils`, `whois`, `tailscale`

### 📱 Android & Reverse Engineering
- `termux-api` (adaptación declarativa nativa `termux-api.nix` con parche de rutas Android/Launcher)
- `android-tools` (adb/fastboot), `apksigner`, `radare2`, `frida-tools`

### 📄 Document Lab & Multimedia
- `typst`, `tectonic`, `pandoc`, `imagemagick`, `tesseract`, `yt-dlp`, `ffmpeg`, `aria2`, `miniserve`, `gh`, `tree`

### 📜 Scripts & Launchers Integrados
- `scripts/horario.sh`: Script interactivo de horarios académicos.
- `scripts/verificar-cod.sh`: Verificador de código y entorno.
- `scripts/install-ai-tools.sh`: Instalador desatendido de paquetes NPM para IA.
- `bin/ytdl`: Wrapper rápido para descargas de video/audio con yt-dlp y aria2.
- `bin/`: Wrappers para Shizuku (`rish`) y Root (`su`, `sudo`, `termux-open`).

---

## 🔄 Actualizar el Sistema

Cada vez que agregues paquetes o modifiques [nix-on-droid.nix](./nix-on-droid.nix) o [home.nix](./home.nix), ejecuta:

```bash
nix-on-droid switch --flake ~/.config/nix-on-droid
```
