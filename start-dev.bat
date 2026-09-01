@echo off
title ShallotWHAM Synth Station Launcher
cls
echo ===================================================
echo             ShallotWHAM SYNTH STATION
echo ===================================================
echo.
echo Select launch mode:
echo   [1] Instant Web Browser (Open in Default Browser)
echo   [2] Instant Electron App (npm start - no compile needed)
echo   [3] Build Release .EXE (electron-builder portable)
echo   [4] Exit
echo.
set /p choice="Choose an option [1-4]: "

if "%choice%"=="1" (
    echo Launching in default web browser...
    start "" "%~dp0index.html"
    exit /b
)
if "%choice%"=="2" (
    echo Starting Electron instant dev mode...
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
    exit /b
)
echo Invalid choice.
pause
