#!/usr/bin/env bash
# ============================================================
# Reparación del runtime nativo de Freebuff (nixglibc)
# Autor: Nix-on-Droid (agente de Camilo)
#
# Problema: el broker de terminal de Freebuff y la búsqueda de
# código fallan con ENOENT aunque el binario rg existe.
# Causa probable: el intérprete ELF /lib/ld-linux-aarch64.so.1
# (grabado dentro de los binarios) no existe en el sistema.
#
# Uso:  bash ~/repair_freebuff.sh
# ============================================================
set -u

CACHE="$HOME/.cache/nixglibc"
LOADER="$CACHE/ld-linux-aarch64.so.1"
RG="$CACHE/rg"
TARGET="/lib/ld-linux-aarch64.so.1"

echo "=============================================="
echo "1. Estado del caché nixglibc"
echo "=============================================="
ls -la "$CACHE" 2>&1 | head -n 20
echo
echo "-- Tipo de archivo del binario rg --"
file "$RG" 2>&1 || true
echo

echo "=============================================="
echo "2. ¿Existe el intérprete ELF en /lib?"
echo "=============================================="
if [ -e "$TARGET" ]; then
  ls -la "$TARGET"
  echo "✅ /lib/ld-linux-aarch64.so.1 existe"
else
  echo "❌ FALTA $TARGET -> esto explica los errores ENOENT"
fi
echo

echo "=============================================="
echo "3. Prueba A: rg lanzado con el cargador explícito"
echo "   (no depende de /lib; verifica que los binarios estén sanos)"
echo "=============================================="
if "$LOADER" --library-path "$CACHE" "$RG" --version 2>&1; then
  echo "✅ Prueba A OK: los binarios de la caché funcionan"
else
  echo "❌ Prueba A falló: binarios corruptos o glibc incompleta"
fi
echo

echo "=============================================="
echo "4. Reparación: crear /lib/ld-linux-aarch64.so.1"
echo "=============================================="
if mkdir -p /lib 2>/dev/null; then
  echo "Directorio /lib disponible (sin sudo)"
elif sudo mkdir -p /lib 2>/dev/null; then
  echo "Directorio /lib creado con sudo"
elif command -v su >/dev/null 2>&1 && su -c "mkdir -p /lib"; then
  echo "Directorio /lib creado con su"
else
  echo "⚠️  No se pudo crear /lib. Intenta: sudo mkdir -p /lib"
fi

if ln -sf "$LOADER" "$TARGET" 2>/dev/null; then
  echo "✅ Enlace creado: $TARGET -> $LOADER"
elif sudo ln -sf "$LOADER" "$TARGET" 2>/dev/null; then
  echo "✅ Enlace creado con sudo: $TARGET -> $LOADER"
elif command -v su >/dev/null 2>&1 && su -c "ln -sf $LOADER $TARGET"; then
  echo "✅ Enlace creado con su: $TARGET -> $LOADER"
else
  echo "❌ No se pudo crear el enlace. Ejecuta manualmente:"
  echo "   sudo ln -sf $LOADER $TARGET"
fi
ls -la "$TARGET" 2>&1 || true
echo

echo "=============================================="
echo "5. Prueba B: ejecución directa del binario rg"
echo "   (si ahora funciona, Freebuff ya podrá usarlo)"
echo "=============================================="
if "$RG" --version 2>&1; then
  echo "✅ Prueba B OK: rg arranca directo"
else
  echo "ℹ️  Si Prueba A pasó pero B falla, hace falta LD_LIBRARY_PATH:"
  echo "   export LD_LIBRARY_PATH=$CACHE"
fi
echo

echo "=============================================="
echo "6. Reinicio limpio del proceso de Freebuff/Launcher"
echo "=============================================="
if [ -x "$HOME/bin/rish" ]; then
  "$HOME/bin/rish" -c "am force-stop com.termux.launcher.nix"
  echo "✅ App detenida. Ahora ábrela de nuevo manualmente (o espera 5s a que se relance)."
else
  echo "ℹ️  rish no encontrado; cierra y abre Freebuff manualmente."
fi
echo
echo "=========== RESUMEN ==========="
echo "Revisa los ✅/❌ de arriba. Después abre Freebuff y pruébame:"
echo "  'ejecuta echo hola'  -> debe responder sin error del broker"
echo "=============================="