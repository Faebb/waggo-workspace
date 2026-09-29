<#
.SYNOPSIS
  Starts Claude Code from the workspace with both product repos and the Obsidian vault attached.
.DESCRIPTION
  Uses --add-dir so the repos and the vault are readable and editable in the session.
  Extra arguments are passed through to claude (e.g. -c to continue, or a prompt).
.EXAMPLE
  .\scripts\claude-waggo.ps1
  .\scripts\claude-waggo.ps1 -c
#>
$workspace = Split-Path -Parent $PSScriptRoot
$reposRoot = Split-Path -Parent $workspace
$vault = if ($env:WAGGO_VAULT) { $env:WAGGO_VAULT } else { Join-Path (Split-Path -Parent (Split-Path -Parent $reposRoot)) 'Vault Waggo' }

$dirs = @((Join-Path $reposRoot 'waggo-api'), (Join-Path $reposRoot 'waggo-mobile'), $vault)
$addDirs = foreach ($dir in $dirs) {
    if (Test-Path $dir) { '--add-dir'; (Resolve-Path $dir).Path }
    else { Write-Warning "No encontrado: $dir" }
}

Push-Location $workspace
try { & claude @addDirs @args }
finally { Pop-Location }
