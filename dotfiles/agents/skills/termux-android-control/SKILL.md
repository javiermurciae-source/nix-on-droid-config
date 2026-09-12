---
name: termux-android-control
description: >-
  Provides procedures and guidelines for interacting directly with Android system features
  from Termux and Nix-on-Droid: taking real-time screenshots and inspecting UI, executing privileged
  commands with Root (UID 0) via rish/su, running ADB commands (pm, am, settings, dumpsys),
  managing Android shared storage (~/storage/), and controlling Termux Launcher multiplexer panes
  and app launching with launcherctl.
---

# Termux & Android Control Skill

This skill documents how to interact with the Android OS and Termux Launcher from this environment.

---

## 1. Captura y Diagnóstico Visual de Pantalla (Screenshots)

El agente puede capturar y ver la pantalla en vivo del dispositivo Android:

* **Comando para capturar pantalla**:
  ```bash
  $HOME/bin/rish -c "/system/bin/screencap -p /data/data/com.termux.launcher.nix/files/home/screen.png"
  ```
* **Inspección visual**:
  Usa la herramienta `view_file` sobre el archivo PNG resultante para ver la pantalla del usuario (útil para diagnosticar errores, ver qué app está abierta o confirmar estados visuales).
* **Atajo del usuario en terminal**:
  La función `shot` guarda capturas con marca de tiempo directamente en `~/storage/pictures/`.

---

## 2. Comandos de Android (ADB nativo sin cables ni Wi-Fi)

No es necesario configurar servidores ADB ni emparejamientos inalámbricos. `$HOME/bin/rish` es un puente directo a la shell de Android:

* **Gestión de paquetes (`pm`)**:
  ```bash
  $HOME/bin/rish -c "pm list packages -3"
  $HOME/bin/rish -c "pm dump <package_name>"
  ```
* **Lanzar actividades e intents (`am`)**:
  ```bash
  $HOME/bin/rish -c "am start -n <package>/<activity>"
  ```
* **Ajustes del sistema (`settings`)**:
  ```bash
  $HOME/bin/rish -c "settings get global airplane_mode_on"
  $HOME/bin/rish -c "settings put system screen_brightness 200"
  ```
* **Telemetría y servicios (`dumpsys`)**:
  ```bash
  $HOME/bin/rish -c "dumpsys battery"
  $HOME/bin/rish -c "dumpsys wifi"
  ```

---

## 3. Superusuario y Permisos Root Reales (`UID 0`)

El entorno cuenta con Root real gestionado por APatch/Magisk vía Shizuku:

* **Binario wrapper**: `$HOME/bin/su` (no existe `sudo` en este entorno).
* **Identidad**: `uid=0(root) gid=0(root) groups=0(root) context=u:r:magisk:s0`.
* **Regla estricta de ejecución**:
  Nunca ejecutar `su` directamente en sesiones de fondo o no interactivas. Se debe abrir y usar un panel de Termux Launcher:
  ```bash
  launcherctl pane open
  launcherctl pane write <id> --enter "su <comando>"
  launcherctl pane read <id>
  ```
* **Precaución con Nix**: Siempre que se llamen binarios de Android desde scripts de Nix, limpiar variables de librerías (`unset LD_LIBRARY_PATH LD_PRELOAD`).

---

## 4. Almacenamiento Compartido de Android (`storage/`)

El usuario tiene el grupo `1077 (AID_EXTERNAL_STORAGE)`, con permisos nativos de lectura y escritura sin necesidad de `su`:

* **Rutas vinculadas en `~/storage/`**:
  * `~/storage/shared` -> `/storage/emulated/0` (raíz del almacenamiento)
  * `~/storage/downloads` -> `/storage/emulated/0/Download`
  * `~/storage/dcim` -> `/storage/emulated/0/DCIM`
  * `~/storage/pictures` -> `/storage/emulated/0/Pictures`
  * `~/storage/documents` -> `/storage/emulated/0/Documents`
  * `~/storage/music` -> `/storage/emulated/0/Music`
  * `~/storage/movies` -> `/storage/emulated/0/Movies`
* **Exploración TUI**:
  * `yz` abre Yazi directamente en `~/storage/shared`.

---

## 5. Control de Termux Launcher (`launcherctl`)

Termux Launcher cuenta con un servidor REST interno controlado por el script CLI `launcherctl`:

* **Lanzar aplicaciones de Android**:
  ```bash
  launcherctl launch <app_name_or_package>
  # Ejemplos: whatsapp, settings, chrome, youtube
  ```
* **Crear paneles divididos persistentes**:
  ```bash
  RES=$(launcherctl pane open --title "<titulo>")
  PANE_ID=$(echo "$RES" | python3 -c "import sys, json; print(json.load(sys.stdin).get('pane', {}).get('id', ''))")
  sleep 1
  launcherctl pane write "$PANE_ID" --enter "<comando>"
  ```
* **Control de paneles**:
  * `launcherctl pane list`: Lista todos los paneles, ventanas, PIDs y dimensiones.
  * `launcherctl pane focus <id>`: Cambia el foco de la pantalla al panel.
  * `launcherctl pane read <id> --lines N`: Lee la salida en texto del panel.
  * `launcherctl pane close <id>`: Cierra el panel.
* **Inteligencia Artificial Local (`tai`)**:
  * `tai status`, `tai models`, `tai load <model>`: Controla modelos locales acelerados por hardware en el proceso `:tai_runtime`.
