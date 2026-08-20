# Kavach EPMS - Equipment & Personnel Management System

## Quick Start Guide

### Running the Application

To start the full-stack application (Backend API + Frontend UI):

1. **Option A: Batch Script (Windows)**
   Double-click or run `start.bat`:
   ```cmd
   .\start.bat
   ```

2. **Option B: PowerShell Script**
   Run `start.ps1`:
   ```powershell
   .\start.ps1
   ```

3. **Option C: Manual Start**
   Open a terminal and run:
   ```cmd
   C:\Users\DELL\.gemini\antigravity\scratch\node-v22.14.0-win-x64\node.exe backend\index.js
   ```

The application will be accessible at:
- **Web Application (Unified UI)**: [http://localhost:3000](http://localhost:3000)
- **API Base URL**: [http://localhost:3000/api](http://localhost:3000/api)
- **Frontend Dev Server (Optional)**: [http://localhost:5173](http://localhost:5173)

---

## Default Credentials

The database auto-seeds with initial data (50 tanks, personnel, overhauls, telemetry, inventory):

| Role | Username | Password |
|---|---|---|
| **Admin (Command HQ)** | `admin` | `admin123` |
| **Regular Operator** | `user` | `user123` |

---

## Features & Modules

- **Tank Management & Fleet Overview**: Track tank serial numbers, operational statuses, manufacturers, unit assignments, weapon systems, and service history.
- **Overhaul & Maintenance Stage Tracking**: Monitor stages from dismantling, component repair, assembly, to quality testing.
- **Telemetry & Engine Diagnostics**: Live/historical telemetry charts for engine temperature, oil pressure, RPM, and vibration.
- **Workforce & Personnel Assignment**: Manage crew assignments, security clearances, and duty roles.
- **Predictive AI Maintenance**: Failure probability prediction and replacement recommendations.
- **DyGM Office & Officer Communication**: Inter-departmental boards, letters, and work orders.
