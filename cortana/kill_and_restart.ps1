# Kill all Python processes
Write-Host "Killing all Python processes..." -ForegroundColor Yellow
taskkill /F /IM python.exe 2>$null

# Wait a moment
Start-Sleep -Seconds 2

# Check if any are still running
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-Host "Warning: Some Python processes are still running" -ForegroundColor Red
    $pythonProcesses | ForEach-Object { Write-Host "  - PID: $($_.Id)" }
} else {
    Write-Host "All Python processes killed successfully!" -ForegroundColor Green
}

Write-Host "`nStarting Cortana bot..." -ForegroundColor Cyan
& .\venv\Scripts\python.exe main.py
