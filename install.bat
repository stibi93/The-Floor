@echo off
echo ===========================================
echo The Floor Jatek Telepito
echo ===========================================

echo.
echo 1. Python kornyezet letrehozasa...
python -m venv venv
call venv\Scripts\activate

echo.
echo 2. Backend csomagok telepitese...
pip install -r backend/requirements.txt

echo.
echo 3. Frontend csomagok telepitese es build...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo ===========================================
echo Telepites sikeres!
echo Inditas a 'run.bat' fajllal.
echo ===========================================
pause

