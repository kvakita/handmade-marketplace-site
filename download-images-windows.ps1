$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ManifestPath = Join-Path $BaseDir "image-manifest.json"
$ImagesDir = Join-Path $BaseDir "public\images"

New-Item -ItemType Directory -Force -Path (Join-Path $ImagesDir "categories") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ImagesDir "masters") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ImagesDir "reviews") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ImagesDir "products") | Out-Null

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

$manifest.PSObject.Properties | ForEach-Object {
    $relative = $_.Name
    $url = $_.Value
    $output = Join-Path $ImagesDir $relative
    $folder = Split-Path -Parent $output
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "Downloading $relative ..."
    Invoke-WebRequest -Uri $url -OutFile $output
}

Write-Host "Done. Images saved into public/images/"
