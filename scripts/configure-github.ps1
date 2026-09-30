<#
.SYNOPSIS
  Applies the Waggo merge policy to the GitHub repos: squash merge only, PR title as the commit message,
  auto-delete branches, and branch protection on main (admins included).
.DESCRIPTION
  Requires the GitHub CLI (gh) with Faebb as the active account (gh auth switch -u Faebb).
  The free plan only allows branch protection on public repos, so the private waggo-workspace only gets
  the merge policy. Use -DryRun to print the calls without executing them.
.EXAMPLE
  .\scripts\configure-github.ps1 -DryRun
  .\scripts\configure-github.ps1 -Repos Faebb/waggo-api
  .\scripts\configure-github.ps1 -Approvals 1      # once there is a second developer
#>
param(
    [string[]]$Repos = @('Faebb/waggo-api', 'Faebb/waggo-mobile', 'Faebb/waggo-workspace'),
    # GitHub does not let authors approve their own PRs: 0 while there is a single developer.
    [ValidateRange(0, 6)][int]$Approvals = 0,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if (-not $DryRun) {
    $account = gh api user --jq .login
    if ($account -ne 'Faebb') { throw "gh is using '$account'. Run: gh auth switch -u Faebb" }
}

# Public repos get branch protection with these required checks (job names from .github/workflows).
$requiredChecks = @{
    'Faebb/waggo-api'    = @('build-test', 'conventional-title')
    'Faebb/waggo-mobile' = @('build-test', 'conventional-title')
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

    if (-not $requiredChecks.ContainsKey($repo)) {
        Write-Host "   OK (private: no branch protection)"
        continue
    }

    # Branch protection on main, admins included: PR with $Approvals approval(s), required checks, linear history.
    $protection = @{
        required_status_checks        = @{ strict = $true; contexts = $requiredChecks[$repo] }
        enforce_admins                = $true
        required_pull_request_reviews = @{ required_approving_review_count = $Approvals; dismiss_stale_reviews = $true }
        restrictions                  = $null
        required_linear_history       = $true
        allow_force_pushes            = $false
        allow_deletions               = $false
    } | ConvertTo-Json -Depth 5

    Invoke-Gh @('api', '-X', 'PUT', "repos/$repo/branches/main/protection") $protection
    Write-Host "   OK"
}
