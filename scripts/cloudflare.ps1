param(
    [ValidateSet('login', 'create-db', 'migrate', 'secrets', 'deploy', 'export')]
    [string]$Action,
    [string]$NodePath = 'node'
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    $cli = Join-Path $projectRoot 'node_modules/wrangler/bin/wrangler.js'
    if (-not (Test-Path -LiteralPath $cli)) { throw 'Instala las dependencias con pnpm install antes de continuar.' }
    function Invoke-Wrangler {
        param([string[]]$Arguments)
        & $NodePath $cli @Arguments
        if ($LASTEXITCODE -ne 0) { throw 'Cloudflare no ha completado la operación; no continúes con el siguiente paso.' }
    }
    if ($Action -in @('migrate', 'deploy', 'export')) {
        $configuration = Get-Content -LiteralPath (Join-Path $projectRoot 'wrangler.jsonc') -Raw | ConvertFrom-Json
        if ($configuration.d1_databases[0].database_id -eq '00000000-0000-0000-0000-000000000000') {
            throw 'Crea D1 y configura su database_id real en wrangler.jsonc antes de continuar.'
        }
    }
    switch ($Action) {
        'login' { Invoke-Wrangler @('login') }
        'create-db' { Invoke-Wrangler @('d1', 'create', 'comemos') }
        'migrate' { Invoke-Wrangler @('d1', 'migrations', 'apply', 'comemos', '--remote') }
        'secrets' {
            # Enter secrets interactively; never embed them in command arguments or logs.
            Invoke-Wrangler @('secret', 'put', 'PASSWORD_PEPPER')
        }
        'deploy' { Invoke-Wrangler @('deploy') }
        'export' {
            $backupFolder = Join-Path $projectRoot 'data/backups'
            New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
            $target = Join-Path $backupFolder ('d1-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.sql')
            Invoke-Wrangler @('d1', 'export', 'comemos', '--remote', '--output', $target)
        }
    }
} finally { Pop-Location }
