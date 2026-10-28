#!/usr/bin/env bash
# Captura una URL con Chrome sin interfaz, de una en una (poca RAM). Solo cierra los procesos que lanzó
# (los reconoce por su carpeta de perfil temporal), nunca otras ventanas de Chrome.
# Uso: captura.sh <url> <salida.png> [ancho] [alto] [banderas extra...]
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
URL="$1"; OUT="$2"; W="${3:-1920}"; H="${4:-1080}"; shift 4 2>/dev/null
PERFIL="$(mktemp -d)"
PERFIL_WIN="$(cygpath -w "$PERFIL")"
timeout 90 "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --user-data-dir="$PERFIL_WIN" --window-size="$W,$H" --virtual-time-budget=4000 \
  --screenshot="$OUT" "$@" "$URL" >/dev/null 2>&1
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -like '*$(basename "$PERFIL")*' } | ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }" >/dev/null 2>&1
rm -rf "$PERFIL" 2>/dev/null
[ -f "$OUT" ] && echo "ok $OUT" || echo "FALLO $OUT"
