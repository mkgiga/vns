@REM windows .bat build script

@REM check if npm is installed

%res%=$(where npm)
if %res%=="INFO: Could not find files for the given pattern(s)." (
    echo "Please install node.js and npm before running this script.
    timeout /t 2
    start https://nodejs.org/en/download/
    exit 1
)
else (
    call npm install
)

call npm run build
