@echo off
REM Run from the same folder as your .exe
set EXE_PATH=app.exe
set SERVICE_NAME=MLLPBird
set SERVICE_ARGS=--logplease --apikey=YOUR_API_KEY

nssm install %SERVICE_NAME% "%CD%\%EXE_PATH%" %SERVICE_ARGS%
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START
nssm start %SERVICE_NAME%
echo Service %SERVICE_NAME% installed and started.
pause