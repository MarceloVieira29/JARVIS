# "pode rodar jarvis main": testa, commita tudo e envia para origin/main (o GitHub Actions publica no Pages)
# Mantenha este arquivo em ASCII: o Windows PowerShell 5.1 le .ps1 sem BOM como ANSI.
param([string]$Mensagem)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot)

npm test
if ($LASTEXITCODE) { throw 'Testes falharam. Nada foi commitado.' }

$branch = git branch --show-current
if ($branch -ne 'main') { throw "Branch atual e '$branch'. Troque para main antes de publicar." }

git add -A
if (git status --porcelain) {
  if (-not $Mensagem) { $Mensagem = "jarvis: atualizacao $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
  $arquivo = Join-Path $env:TEMP 'jarvis-commit-msg.txt'
  [IO.File]::WriteAllText($arquivo, $Mensagem, (New-Object Text.UTF8Encoding $false))
  git commit -F $arquivo
  $falhou = $LASTEXITCODE
  Remove-Item $arquivo
  if ($falhou) { throw 'Commit falhou.' }
} else {
  Write-Host 'Nada novo para commitar.'
}

git push -u origin main
if ($LASTEXITCODE) { throw 'Push falhou.' }
Write-Host 'Enviado para main. Pages: https://marcelovieira29.github.io/JARVIS/'
