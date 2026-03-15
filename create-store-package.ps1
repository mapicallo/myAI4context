# create-store-package.ps1
# Crea el ZIP para subir a Chrome Web Store y Edge Add-ons
# Ejecutar desde la raíz del proyecto: .\create-store-package.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$zipPath = Join-Path $root "myAI4context-store.zip"

# Eliminar ZIP anterior si existe
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Carpetas y archivos a incluir
$items = @(
    "manifest.json",
    "popup",
    "settings",
    "share",
    "content",
    "background",
    "assets",
    "libs"
)

# Verificar que existan
foreach ($item in $items) {
    $path = Join-Path $root $item
    if (-not (Test-Path $path)) {
        Write-Warning "No encontrado: $item"
    }
}

# Crear ZIP
$itemsToZip = $items | ForEach-Object { Join-Path $root $_ } | Where-Object { Test-Path $_ }
Compress-Archive -Path $itemsToZip -DestinationPath $zipPath -Force

Write-Host "Creado: $zipPath" -ForegroundColor Green
Write-Host "Tamaño: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB"
