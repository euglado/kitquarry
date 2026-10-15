@echo off
cd /d "%~dp0"
node scripts/run.mjs register
set "KITQUARRY_EXIT=%errorlevel%"
pause
exit /b %KITQUARRY_EXIT%
