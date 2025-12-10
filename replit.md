# Timesheet Manager - Electron Desktop Application

## Overview

A Windows desktop application for accounting firm timesheet management. Built with Electron, React, and SQLite. The application manages clients, employees, and timesheets with automatic charge-out calculations based on historical employee rates. Key features include role-based authentication, CSV/Excel import, PDF/Excel report generation, Google Drive sync for multi-user access, and backup/restore functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with functional components
- **Styling**: Tailwind CSS with custom theme colors (primary blue: #2980BA)
- **Build Tool**: Vite for fast development and production builds
- **Entry Point**: `src/main.jsx` renders into `index.html`

### Desktop Framework
- **Electron** provides the desktop shell with main process (`electron/main.js`) and renderer process separation
- **Preload Script** (`electron/preload.js`) exposes a secure `window.electron` API using `contextBridge`
- **IPC Communication**: All data operations flow through `ipcRenderer.invoke()` calls to handlers in `electron/ipc-handlers.js`

### Database Layer
- **SQLite** via `better-sqlite3` for synchronous, performant local storage
- **Journal Mode**: Uses DELETE mode (not WAL) for immediate write visibility and better compatibility with file sync services
- **Database Manager** (`electron/database.js`) handles initialization, table creation, and connection management
- **Default Location**: User data directory, but supports custom paths for Google Drive sync
- **Server-Side Pagination**: Large datasets (500K+ records) handled with LIMIT/OFFSET and composite indexes

### Data Models
- **Users**: Authentication with bcrypt password hashing, role-based permissions (Admin/Normal)
- **Clients**: Client ID, name, notes
- **Employees**: Name, hourly rate with automatic rate history tracking
- **Timesheets**: Three entry types (Normal/Close-off/Transfer) with automatic charge-out calculation based on historical rates
- **Audit Logs**: Track all data changes

### Authentication & Authorization
- **bcrypt** for password hashing
- **Role-based access**: Admin users have full access; Normal users have granular permissions (view, edit, create, delete, export)
- **Session management**: Current user stored in memory on the main process

### Report Generation
- **Excel Export**: Using `xlsx` library
- **PDF Export**: Using `jsPDF` with `jspdf-autotable` plugin
- **PDF Specifications**: A4 portrait, 7mm margins, 188mm table width, specific column layouts and styling

### File Sync
- **Google Drive Integration**: Database file can be stored in synced folder
- **File Watcher**: Uses `chokidar` to detect external database changes and reload
- **Electron Store**: Persists sync path and user preferences

## External Dependencies

### Core Libraries
- **better-sqlite3**: Native SQLite bindings for Node.js
- **bcrypt**: Password hashing
- **electron-store**: Persistent key-value storage for app settings
- **date-fns**: Date manipulation and formatting

### Import/Export
- **xlsx**: Excel file reading and writing
- **papaparse**: CSV parsing (referenced in features, used for import)
- **jspdf**: PDF generation
- **jspdf-autotable**: Table formatting for PDF reports

### File System
- **chokidar**: File system watcher for sync functionality

### Build & Distribution
- **electron-builder**: Packages app as Windows installer (NSIS)
- **Vite**: Development server and production bundler
- **concurrently/wait-on**: Development workflow orchestration