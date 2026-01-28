..\.venv\Scripts\activate && FOR /D %%i IN (*.*) DO (
    if not exist "%~dp0%%i\pyinst" mkdir "%~dp0%%i\pyinst"
    cd "%~dp0%%i\pyinst"
    pyinstaller --paths "%~dp0utils" -y --onefile --distpath ".." ../main.py
)
