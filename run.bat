@echo off
echo ===========================================
echo The Floor Jatek Inditasa
echo ===========================================

call venv\Scripts\activate

echo.
echo Szerver inditasa...
echo A jatek elerheto a bongeszoben: http://localhost:8000
echo Admin felulet: http://localhost:8000/admin
echo.
echo A kilepeshez zarja be ezt az ablakot.

start http://localhost:8000
python backend/app.py

pause

