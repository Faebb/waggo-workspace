#!/usr/bin/env bash
# Exporta una presentación a PDF (una lámina por página). Uso: exportar-pdf.sh <carpeta-presentacion>
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
DIR="$(cd "$1" && pwd -W)"
PERFIL="$(mktemp -d)"
timeout 180 "$CHROME" --headless=new --disable-gpu --no-sandbox --user-data-dir="$(cygpath -w "$PERFIL")" \
  --virtual-time-budget=8000 --no-pdf-header-footer --print-to-pdf="$DIR/presentacion.pdf" "file:///$DIR/index.html?imprimir" >/dev/null 2>&1
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -like '*$(basename "$PERFIL")*' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1
rm -rf "$PERFIL" 2>/dev/null
ls -la "$DIR/presentacion.pdf" && grep -a -c "/Type /Page$\|/Type /Page[^s]" "$DIR/presentacion.pdf"
