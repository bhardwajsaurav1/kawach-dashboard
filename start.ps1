$env:PATH = "C:\Users\DELL\.gemini\antigravity\scratch\node-v22.14.0-win-x64;" + $env:PATH
Write-Host "Starting Kavach EPMS Backend Server on http://localhost:3000 ..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
node index.js
