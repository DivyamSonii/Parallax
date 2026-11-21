@echo off
title Google ADK Character Agent Server
echo ==================================================================
echo   Starting Google ADK (Agent Development Kit) Character Server
echo   Host: http://localhost:8000
echo ==================================================================
cd /d "%~dp0\backend"
python server.py
pause
