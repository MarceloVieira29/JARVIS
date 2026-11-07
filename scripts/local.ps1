# "pode rodar jarvis local": testa, sobe o Worker (se houver worker/.dev.vars) e serve web/ em http://localhost:8000
# Mantenha este arquivo em ASCII: o Windows PowerShell 5.1 le .ps1 sem BOM como ANSI.
param([switch]$SemTestes, [switch]$SemNavegador)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot)

if (-not $SemTestes) {
  npm test
  if ($LASTEXITCODE) { throw 'Testes falharam. Corrija antes de rodar.' }
}

if ((Test-Path worker/.dev.vars) -and (Select-String -Path worker/.dev.vars -Pattern 'coloque-sua-chave-aqui' -Quiet)) {
  Write-Host 'worker/.dev.vars ainda sem ANTHROPIC_API_KEY: a IA livre fica desligada. Cole a chave no arquivo e rode de novo.'
} elseif (Test-Path worker/.dev.vars) {
  Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$PWD'; npm run worker"
  Write-Host 'Worker de IA subindo em http://localhost:8787 (outra janela).'
} else {
  Write-Host 'Sem worker/.dev.vars: a IA livre fica desligada. Copie worker/.dev.vars.example para ativar.'
}

if (-not $SemNavegador) { Start-Process 'http://localhost:8000' }
npm run dev
