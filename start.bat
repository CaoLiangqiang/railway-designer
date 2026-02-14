@echo off
chcp 65001
@echo ============================================
@echo      Railway Designer Launcher
@echo ============================================
@echo.

@echo Checking port 5173...
@for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    @echo Found process using port 5173: PID %%a
    @echo Killing process...
    @taskkill /PID %%a /F >nul 2>&1
    @echo Process killed.
)
@echo.

@echo Starting application...
@echo.

node -v >nul 2>&1
if errorlevel 1 (
    @echo Error: Node.js not found
    @echo.
    @echo Please install Node.js first
    @echo Download: https://nodejs.org/
    @echo.
    pause
    exit /b 1
)

@echo Node.js is installed
@echo.

if not exist "node_modules" (
    @echo First run, installing dependencies...
    @echo This may take a few minutes...
    @echo.
    call npm install
    if errorlevel 1 (
        @echo.
        @echo Installation failed
        pause
        exit /b 1
    )
    @echo.
    @echo Dependencies installed!
    @echo.
)

@echo Starting server...
@echo.
@echo ============================================
@echo The app will open in browser
@echo If not, visit: http://localhost:5173/
@echo ============================================
@echo.

npm run dev

@echo.
@echo Server stopped
@echo.
pause
