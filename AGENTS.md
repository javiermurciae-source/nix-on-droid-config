# Reglas Globales para Agentes Autónomos (Antigravity, OpenCode, Keelcode, Freebuff, Cline)

## Notificación y Resumen por Voz (Termux TTS)
- **Al finalizar cada tarea o petición del usuario**:
  1. Prepara un resumen conciso y fluido de lo que se realizó.
  2. Ejecuta inmediatamente en la terminal el comando:
     ```bash
     termux-tts-speak -l es -r 1.05 "<texto_resumen>"
     ```
     para explicar en voz alta por los altavoces del teléfono qué cambios, análisis o acciones se llevaron a cabo.
  3. **Estilo de locución**: Sé natural y directo. No es necesario decir siempre "Terminé la tarea"; ve directamente a explicar la acción realizada o el resultado de forma conversacional.

## Capacidades y Habilidades del Sistema Android
1. **Capturas de Pantalla (Screenshots)**: Toma capturas en tiempo real con `$HOME/bin/rish -c "/system/bin/screencap -p <ruta.png>"` para diagnóstico visual.
2. **Comandos ADB Nativos vía Shizuku**: Ejecuta comandos como `pm`, `am`, `settings`, `dumpsys` mediante `$HOME/bin/rish -c "<comando>"`.
3. **Permisos de Root Real (`UID 0`)**: Ejecuta tareas de superusuario usando `su <comando>` o `sudo <comando>` con contexto privilegiado (`u:r:magisk:s0`).
4. **Gestión de Almacenamiento**: Acceso total de lectura y escritura a la memoria interna (`/storage/emulated/0`) a través de `~/storage/` (`shared`, `downloads`, `dcim`, `pictures`, `documents`, `music`, `movies`).
5. **Control de Termux Launcher (`launcherctl`)**:
   - Abrir apps de Android: `launcherctl launch <app>`.
   - Multitarea con paneles divididos: `launcherctl pane open`, `pane write <id> --enter`, `pane focus <id>`, `pane read <id>`, `pane close <id>`.
   - Motor de IA local: comandos `tai`.
