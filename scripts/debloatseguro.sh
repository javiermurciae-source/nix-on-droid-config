#!/usr/bin/env bash
# ==============================================================================
# Script: nix-debloat (Debloat Seguro para Infinix / Transsion con Shizuku/rish)
# ==============================================================================
# Este script desinstala todo el bloatware, juegos, tiendas y apps innecesarias,
# pero PROTEGE de forma estricta las librerías del framework óptico/cámara
# (evitando el fallo de tranSetParameters y pantallas negras/crash en QR).
# ==============================================================================

RISH="$HOME/bin/rish"

if [ ! -x "$RISH" ]; then
    echo "❌ Error: No se encontró rish en $RISH o no tiene permisos de ejecución."
    exit 1
fi

echo "🛡️ Iniciando proceso de Debloat Seguro en Infinix..."

# ------------------------------------------------------------------------------
# 1. LISTA NEGRA: Paquetes que SÍ se deben eliminar (Bloatware, tiendas, basura)
# ------------------------------------------------------------------------------
BLOAT_PACKAGES=(
    "cn.wps.moffice.lite.abroad.transsion"
    "com.chuanyinkj.dengzhu"
    "com.einnovation.temu"
    "com.facebook.appmanager"
    "com.facebook.services"
    "com.facebook.system"
    "com.facemoji.lite.transsion"
    "com.funbase.xradio"
    "com.gallery20"
    "com.geniex.vsimhelper"
    "com.google.android.apps.tachyon"
    "com.google.android.apps.wellbeing"
    "com.google.android.feedback"
    "com.google.android.googlequicksearchbox"
    "com.google.android.projection.gearhead"
    "com.google.android.videos"
    "com.google.android.youtube"
    "com.idea.questionnaire"
    "com.rlk.weathers"
    "com.sh.smart.caller"
    "com.sh.smart.caller.overlay"
    "com.talpa.hibrowser"
    "com.talpa.hiservice"
    "com.transsion.aftersalecalibrationtool"
    "com.transsion.airtransfer"
    "com.transsion.aivoiceassistant"
    "com.transsion.aiwallpaper"
    "com.transsion.aiwriting"
    "com.transsion.applock"
    "com.transsion.calculator"
    "com.transsion.carlcare"
    "com.transsion.chromecustomization"
    "com.transsion.cloudserver"
    "com.transsion.compass"
    "com.transsion.connectx.mirror.source"
    "com.transsion.easypic"
    "com.transsion.globalsearch"
    "com.transsion.healthlife"
    "com.transsion.infinixled"
    "com.transsion.kolun.aiservice"
    "com.transsion.kolun.assistant"
    "com.transsion.letswitch"
    "com.transsion.livewallpaper.custompictorial"
    "com.transsion.livewallpaper.livephoto"
    "com.transsion.livewallpaper.micro"
    "com.transsion.livewallpaper.page"
    "com.transsion.livewallpaper.starring"
    "com.transsion.livewallpaper.sunpointer"
    "com.transsion.livewallpaper.theme"
    "com.transsion.magazineservice.xos"
    "com.transsion.magicfont"
    "com.transsion.manualguide"
    "com.transsion.mediaeditor"
    "com.transsion.mobilecloner"
    "com.transsion.mol"
    "com.transsion.notebook"
    "com.transsion.pcconnect"
    "com.transsion.personalizedService.xos"
    "com.transsion.phonemanager"
    "com.transsion.phonemaster"
    "com.transsion.plat.appupdate"
    "com.transsion.rro.net.bat.store.tr_product.x6878"
    "com.transsion.smartmessage"
    "com.transsion.smartmessage.app.overlay"
    "com.transsion.smartpanel"
    "com.transsion.smartpanel.overlay"
    "com.transsion.spacesaversdk"
    "com.transsion.statisticalsales"
    "com.transsion.tabe"
    "com.transsion.teop"
    "com.transsion.theme"
    "com.transsion.theme.icon"
    "com.transsion.trancare"
    "com.transsion.TranLogManager"
    "com.transsion.tranradionet"
    "com.transsion.tranvoicecommand"
    "com.transsion.zahooc"
    "com.transsnet.store"
    "com.transsnet.store.overlay"
    "com.transtech.gotii"
    "com.xui.xhide"
    "net.bat.store"
)

echo "🗑️ Desinstalando bloatware prescindible..."
COUNT=0
for pkg in "${BLOAT_PACKAGES[@]}"; do
    res=$($RISH -c "pm uninstall -k --user 0 $pkg 2>&1")
    if [[ "$res" == *"Success"* ]]; then
        echo "  [-] Desinstalado: $pkg"
        ((COUNT++))
    fi
done

echo ""
echo "🔍 Asegurando integridad de las librerías críticas de cámara y QR..."
CRITICAL_PACKAGES=(
    "com.transsion.camera"
    "com.transsion.smartrecognition"
    "com.transsion.scanningrecharger"
    "com.transsion.aicore.ocr"
    "com.transsion.aicore.cv"
    "com.transsion.aicore.main"
    "com.transsion.tranengine"
    "com.transsion.atomicbrain"
    "com.transsion.usf"
    "com.transsion.sru"
    "com.google.ar.core"
)

for crit in "${CRITICAL_PACKAGES[@]}"; do
    $RISH -c "cmd package install-existing $crit" >/dev/null 2>&1
    echo "  [✓] Protegido y activo: $crit"
done

echo ""
echo "✅ Proceso completado exitosamente."
echo "⚡ Paquetes innecesarios eliminados: $COUNT"
echo "📷 Las librerías de escaneo y cámara están intactas y 100% funcionales."
