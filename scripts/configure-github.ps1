<#
.SYNOPSIS
  Applies the Waggo merge policy to the GitHub repos: squash merge only, PR title as the commit message,
  auto-delete branches, and branch protection on main.
.DESCRIPTION
  Requires the GitHub CLI (gh) authenticated with admin rights on the repos. Run it only once the repos
  exist on GitHub. Use -DryRun to print the calls without executing them.
.EXAMPLE
  .\scripts\configure-github.ps1 -DryRun
  .\scripts\configure-github.ps1 -Repos Faebb/waggo-api
  .\scripts\configure-github.ps1 -Approvals 0      # while there is a single developer
#>
param(
    [string[]]$Repos = @('Faebb/waggo-api', 'Faebb/waggo-mobile', 'Faebb/waggo-workspace'),
    # GitHub does not let authors approve their own PRs: use 0 while there is a single developer.
    [ValidateRange(0, 6)][int]$Approvals = 1,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# Status checks required on main, per repo (job names from .github/workflows).
$requiredChecks = @{
    'Faebb/waggo-api'       = @('build-test', 'conventional-title')
    'Faebb/waggo-mobile'    = @('build-test', 'conventional-title')
    'Faebb/waggo-workspace' = @()
}

function Invoke-Gh([string[]]$ghArgs, [string]$body) {
    if ($DryRun) {
        Write-Host "gh $($ghArgs -join ' ')"
        if ($body) { Write-Host $body }
        return
    }
    if ($body) { $body | gh @ghArgs --input - | Out-Null } else { gh @ghArgs | Out-Null }
    if ($LASTEXITCODE -ne 0) { throw "gh $($ghArgs -join ' ') failed" }
}

foreach ($repo in $Repos) {
    Write-Host "== $repo"

    # Merge policy: squash only, commit = PR title + description, delete branch after merge.
    Invoke-Gh @('api', '-X', 'PATCH', "repos/$repo",
        '-F', 'allow_squash_merge=true',
        '-F', 'allow_merge_commit=false',
        '-F', 'allow_rebase_merge=false',
        '-F', 'delete_branch_on_merge=true',
        '-f', 'squash_merge_commit_title=PR_TITLE',
        '-f', 'squash_merge_commit_message=PR_BODY')

    # Branch protection on main: PR required with $Approvals approval(s), required checks, linear history.
    $protection = @{
        required_status_checks        = if ($requiredChecks[$repo].Count) { @{ strict = $true; contexts = $requiredChecks[$repo] } } else { $null }
        enforce_admins                = $false
        required_pull_request_reviews = @{ required_approving_review_count = $Approvals; dismiss_stale_reviews = $true }
        restrictions                  = $null
        required_linear_history       = $true
        allow_force_pushes            = $false
        allow_deletions               = $false
    } | ConvertTo-Json -Depth 5

    Invoke-Gh @('api', '-X', 'PUT', "repos/$repo/branches/main/protection") $protection
    Write-Host "   OK"
}
