#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════
# 🤖 Instalador automatizado de Herramientas de IA vía NPM
# (Para herramientas no empaquetadas nativamente en Nixpkgs)
# ════════════════════════════════════════════════════════════════
set -e

echo "==> Verificando e instalando herramientas de IA (NPM global)..."

# Lista de paquetes NPM requeridos para los wrappers de bin/ y automatización ofimática
AI_PACKAGES=(
  "antigravity-cli"
  "cline"
  "@keelcode-ai/keelcode"
  "freebuff"
  "pptxgenjs"
  "exceljs"
  "docx"
)

for pkg in "${AI_PACKAGES[@]}"; do
  echo "--> Instalando / actualizando: $pkg"
  npm install -g "$pkg" || echo "Aviso: fallo al instalar $pkg, verificar conexión."
done

echo "==> ¡Herramientas de IA y Ofimática instaladas correctamente!"
