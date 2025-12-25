@echo off
echo Killing all Python processes...
taskkill /F /IM python.exe >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo Starting Cortana bot...
echo.
venv\Scripts\python.exe main.py
