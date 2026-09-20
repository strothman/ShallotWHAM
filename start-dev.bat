@echo off
title ShallotWHAM Synth Station Launcher
cls
echo ===================================================
echo             ShallotWHAM SYNTH STATION
echo ===================================================
echo.
echo Select launch mode:
echo   [1] Web Browser (Local Server http://localhost:8085)
echo   [2] Desktop App (Instant Electron Window)
echo   [3] Build Release .EXE (Portable Standalone)
echo   [4] Direct File (Open index.html directly)
echo   [5] Exit
echo.
set /p choice="Choose an option [1-5]: "

if "%choice%"=="1" (
    echo Starting local web server on port 8085...
    cd /d "%~dp0"
    start "" http://localhost:8085/index.html
    python -m http.server 8085
    exit /b
)
if "%choice%"=="2" (
    echo Starting Electron desktop app...
    cd /d "%~dp0"
    npm start
    exit /b
)
if "%choice%"=="3" (
    echo Packaging standalone Windows portable EXE...
    cd /d "%~dp0"
    npm run build
    pause
    exit /b
)
if "%choice%"=="4" (
    echo Launching index.html directly...
    start "" "%~dp0index.html"
    exit /b
)
if "%choice%"=="5" (
    exit /b
)
echo Invalid choice.
pause
