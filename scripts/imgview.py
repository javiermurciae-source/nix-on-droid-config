#!/usr/bin/env python3
"""
imgview - Visor de imágenes interactivo para Termux Launcher
- Protocolo gráfico Kitty nativo.
- Auto-ajuste de aspecto (conserva proporción exacta, sin estirar).
- Centrado óptico en el panel/pantalla.
- Navegación con flechas (←/→ o ↑/↓ o Espacio).
- Enter abre directamente el archivo de imagen.
- 'q' o Esc para salir.
"""

import os
import sys
import termios
import tty
import shutil
import base64
import subprocess
import signal

IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp')

def get_key():
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        ch = sys.stdin.read(1)
        if ch == '\x1b':
            ch2 = sys.stdin.read(1)
            if ch2 == '[':
                ch3 = sys.stdin.read(1)
                if ch3 == 'A':
                    return 'up'
                elif ch3 == 'B':
                    return 'down'
                elif ch3 == 'C':
                    return 'right'
                elif ch3 == 'D':
                    return 'left'
            return 'esc'
        elif ch in ('\r', '\n'):
            return 'enter'
        elif ch in ('q', 'Q'):
            return 'quit'
        elif ch == ' ':
            return 'space'
        return ch
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)

def clear_screen():
    # \033_Ga=d,d=a\033\\ borra todas las imágenes gráficas de Kitty en pantalla
    sys.stdout.write("\033[2J\033[H\033_Ga=d,d=a\033\\")
    sys.stdout.flush()

def get_image_dimensions(image_path):
    # Obtener ancho y alto en píxeles usando identify de ImageMagick
    try:
        out = subprocess.check_output(
            ["identify", "-ping", "-format", "%w %h", image_path],
            stderr=subprocess.DEVNULL
        ).decode('ascii').strip()
        parts = out.split()
        return int(parts[0]), int(parts[1])
    except Exception:
        return 800, 600

def display_image(image_path, index, total):
    clear_screen()
    cols, lines = shutil.get_terminal_size()

    filename = os.path.basename(image_path)
    header = f" [{index + 1}/{total}] {filename}"
    if len(header) > cols:
        header = header[:cols - 3] + "..."

    sys.stdout.write(f"\033[1;36m{header}\033[0m\n")
    sys.stdout.flush()

    # Altura y ancho disponibles para la imagen dentro de la terminal
    avail_rows = max(3, lines - 3)
    avail_cols = max(5, cols - 2)

    # Dimensiones reales de la imagen
    orig_w, orig_h = get_image_dimensions(image_path)

    # Una celda de texto suele medir ~1:2 en proporción (ej: 10px ancho x 20px alto)
    # Por lo tanto, el aspect ratio de la celda es aprox 0.5
    cell_aspect = 0.5

    # Calculamos el tamaño en celdas manteniendo la proporción original
    # ancho_celdas / alto_celdas = (orig_w / orig_h) / cell_aspect
    img_aspect_cells = (orig_w / orig_h) / cell_aspect

    # Ajustamos para que quepa perfectamente dentro de avail_cols y avail_rows
    target_cols = avail_cols
    target_rows = int(target_cols / img_aspect_cells)

    if target_rows > avail_rows:
        target_rows = avail_rows
        target_cols = int(target_rows * img_aspect_cells)

    # Garantizamos límites mínimos
    target_cols = max(2, min(avail_cols, target_cols))
    target_rows = max(2, min(avail_rows, target_rows))

    # Centrado horizontal: calcular columna de inicio
    left_padding = max(0, (cols - target_cols) // 2)

    # Convertimos la imagen al tamaño exacto de píxeles para máxima nitidez y bajo peso
    # Asumiendo ~12px por celda de ancho x 24px por celda de alto
    px_w = target_cols * 12
    px_h = target_rows * 24
    thumb_path = os.path.expanduser("~/.tmp/imgview_render.png")

    subprocess.run([
        "magick", image_path,
        "-auto-orient",
        "-resize", f"{px_w}x{px_h}!",
        thumb_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    img_to_send = thumb_path if os.path.exists(thumb_path) else image_path

    try:
        with open(img_to_send, 'rb') as f:
            raw_data = f.read()
        b64_data = base64.b64encode(raw_data).decode('ascii')

        # Posicionar cursor en la fila 2 y con el sangrado horizontal calculado
        sys.stdout.write(f"\033[2;{left_padding + 1}H")
        sys.stdout.flush()

        # Enviar con protocolo Kitty especificando el número exacto de celdas (c=cols, r=rows)
        chunk_size = 4096
        for i in range(0, len(b64_data), chunk_size):
            chunk = b64_data[i:i + chunk_size]
            m = 1 if (i + chunk_size < len(b64_data)) else 0
            if i == 0:
                cmd = f"\033_Ga=T,f=100,c={target_cols},r={target_rows},m={m};{chunk}\033\\"
            else:
                cmd = f"\033_Gm={m};{chunk}\033\\"
            sys.stdout.write(cmd)
            sys.stdout.flush()
    except Exception:
        pass

    # Barra inferior fija en la última línea
    sys.stdout.write(f"\033[{lines};0H")
    footer = " [←] Ant  [→] Sig  [Enter] Abrir foto  [q] Salir"
    sys.stdout.write(f"\033[1;30;47m{footer.ljust(cols)}\033[0m")
    sys.stdout.flush()

def open_image(image_path):
    abs_path = os.path.abspath(image_path)
    res = subprocess.run(["termux-open", abs_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode != 0:
        rish = os.path.expanduser("~/bin/rish")
        if os.path.exists(rish):
            subprocess.run([
                rish, "-c",
                f"am start -a android.intent.action.VIEW -t 'image/*' -d 'file://{abs_path}'"
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def find_images(target):
    if os.path.isfile(target):
        folder = os.path.dirname(target) or "."
        selected_file = os.path.abspath(target)
    elif os.path.isdir(target):
        folder = target
        selected_file = None
    else:
        folder = "."
        selected_file = None

    all_files = sorted(os.listdir(folder))
    images = [
        os.path.join(folder, f) for f in all_files
        if f.lower().endswith(IMAGE_EXTENSIONS) and os.path.isfile(os.path.join(folder, f))
    ]
    return images, selected_file

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    images, selected = find_images(target)

    if not images:
        print(f"No se encontraron imágenes en: {target}")
        sys.exit(1)

    idx = 0
    if selected:
        try:
            idx = [os.path.abspath(img) for img in images].index(selected)
        except ValueError:
            idx = 0

    # Auto-redibujado responsive cuando cambie el tamaño del panel
    def on_resize(signum, frame):
        display_image(images[idx], idx, len(images))

    signal.signal(signal.SIGWINCH, on_resize)

    try:
        while True:
            display_image(images[idx], idx, len(images))
            key = get_key()
            if key in ('right', 'down', 'space'):
                idx = (idx + 1) % len(images)
            elif key in ('left', 'up'):
                idx = (idx - 1) % len(images)
            elif key == 'enter':
                cols, lines = shutil.get_terminal_size()
                sys.stdout.write(f"\033[{lines};0H\033[1;32;40m Abriendo imagen... \033[0m")
                sys.stdout.flush()
                open_image(images[idx])
            elif key in ('quit', 'esc'):
                break
    finally:
        clear_screen()

if __name__ == "__main__":
    main()
