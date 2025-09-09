@echo off
echo 🚀 Quick Deploy to Netlify
echo.
echo This will create a zip file for easy deployment
echo.

:: Create deployment directory
if exist deploy rmdir /s /q deploy
mkdir deploy

:: Copy necessary files
copy index.html deploy\
xcopy css deploy\css\ /E /I
xcopy js deploy\js\ /E /I

:: Create zip file
powershell -command "Compress-Archive -Path 'deploy\*' -DestinationPath 'digital-notice-board.zip' -Force"

:: Cleanup
rmdir /s /q deploy

echo.
echo ✅ Deployment package created: digital-notice-board.zip
echo.
echo 🌐 Quick Deploy Options:
echo 1. Go to netlify.com
echo 2. Drag and drop 'digital-notice-board.zip'
echo 3. Get instant live link!
echo.
echo 📁 Or upload to any hosting service
echo.
pause
