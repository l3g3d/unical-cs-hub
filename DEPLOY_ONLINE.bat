@echo off
title UNICAL CS HUB - 1-Click Online Deployer
echo ========================================================
echo    UNICAL CS HUB - DEPLOY TO NETLIFY & GITHUB
echo    Course Representative: Divine Christopher Inyang
echo    Live Netlify: https://unicalcshub.netlify.app
echo    Live GitHub:  https://l3g3d.github.io/unical-cs-hub/
echo ========================================================
echo.
echo [1/3] Building latest production assets with postbuild...
call npm run build
echo.
echo [2/3] Syncing and pushing to GitHub (triggers auto-build)...
git add -A
git commit -m "Production release deployment"
git push origin main
echo.
echo [3/3] Opening Netlify Deploys in your browser...
start https://app.netlify.com/sites/unicalcshub/deploys
explorer "%~dp0dist"
echo.
echo ========================================================
echo  DEPLOYMENT COMPLETE!
echo  
echo  1. If your Netlify is connected to GitHub:
echo     It is ALREADY deploying automatically!
echo
echo  2. If you are using Netlify Manual Drag & Drop:
echo     Simply drag the opened "dist" folder onto the Netlify page!
echo ========================================================
pause
