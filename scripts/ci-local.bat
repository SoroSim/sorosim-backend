@echo off
REM Local CI validation script for Windows
REM Run this before pushing to ensure CI will pass

echo.
echo Running local CI checks...
echo.

REM Lint
echo Running lint...
call npm run lint
if errorlevel 1 (
    echo Lint failed!
    exit /b 1
)
echo Lint passed
echo.

REM Build
echo Running build...
call npm run build
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)
echo Build passed
echo.

REM Test
echo Running tests...
call npm test
if errorlevel 1 (
    echo Tests failed!
    exit /b 1
)
echo Tests passed
echo.

REM CLI verification
echo Verifying CLI...
node dist/cli/index.js --version
if errorlevel 1 (
    echo CLI verification failed!
    exit /b 1
)
node dist/cli/index.js --help > nul
if errorlevel 1 (
    echo CLI verification failed!
    exit /b 1
)
echo CLI verification passed
echo.

echo All local CI checks passed!
echo You can safely push your changes.
