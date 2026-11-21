@echo off
title UNICAL CS HUB - 1-Click Online Deployer
echo ========================================================
echo    UNICAL CS HUB - DEPLOY TO NETLIFY
echo    Course Representative: Divine Christopher Inyang
echo    Live Target: https://unicalcshub.netlify.app
echo ========================================================
echo.
echo [1/2] Building latest production assets...
call npm run build
echo.
echo [2/2] Opening Netlify Deploys in your browser...
start https://app.netlify.com/sites/unicalcshub/deploys
echo.
echo [3/3] Opening dist folder in Windows Explorer...
explorer "%~dp0dist"
echo.
echo ========================================================
echo  INSTRUCTIONS:
echo  1. On the Netlify page that just opened, look at the
echo     box at the bottom that says:
echo     "Need to update your site? Drag and drop your site
echo      output folder here"
echo  2. Drag and drop the opened "dist" folder right into it!
echo  3. Your website at unicalcshub.netlify.app updates instantly!
echo ========================================================
pause
