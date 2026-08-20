@echo off
SET PATH=C:\Users\DELL\.gemini\antigravity\scratch\node-v22.14.0-win-x64;%PATH%
echo Starting Kavach EPMS Backend & Frontend...
cd backend
start "Kavach Backend" node index.js
cd ..\frontend
start "Kavach Frontend" npm run dev
echo Kavach EPMS is launching!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
