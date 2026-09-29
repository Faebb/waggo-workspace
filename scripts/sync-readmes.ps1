<#
.SYNOPSIS
  Copies each product repo's README.md into projects/<repo>/README.md.
.DESCRIPTION
  The README in each repo is the source of truth; the copies here are read-only mirrors
  so the workspace documents every project in one place. Run after a README changes.
.PARAMETER Check
  Only report which copies are out of date; exit 1 if any are (useful in CI).
#>
param([switch]$Check)

$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$reposRoot = Split-Path -Parent $workspace
$projects = @('waggo-api', 'waggo-mobile')
$outdated = 0

foreach ($name in $projects) {
    $source = Join-Path $reposRoot "$name/README.md"
    $target = Join-Path $workspace "projects/$name/README.md"

    if (-not (Test-Path $source)) {
        Write-Warning "${name}: $source not found (is the repo cloned next to waggo-workspace?)"
        continue
    }

    $commit = (git -C (Join-Path $reposRoot $name) log -1 --format='%h' -- README.md 2>$null)
    $header = "<!-- Copia generada por scripts/sync-readmes.ps1 desde $name/README.md @ $commit. No editar aquí. -->`n`n"
    $content = $header + (Get-Content -Raw -Encoding utf8 $source)
    $current = if (Test-Path $target) { Get-Content -Raw -Encoding utf8 $target } else { '' }

    if ($current -eq $content) {
        Write-Host "= $name (sin cambios)"
        continue
    }

    $outdated++
    if ($Check) {
        Write-Host "! $name desactualizado"
    }
    else {
        New-Item -ItemType Directory -Force (Split-Path -Parent $target) | Out-Null
        Set-Content -NoNewline -Encoding utf8 -Path $target -Value $content
        Write-Host "+ $name actualizado"
    }
}

if ($Check -and $outdated -gt 0) { exit 1 }
