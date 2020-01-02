@ECHO OFF

chcp 65001 > nul

IF %0 == "%~0" (
	rem estou no executar
	pushd %userprofile%\Desktop
) else (
	pushd %cd%
)

echo OutputFolder: %cd%

rem estou na linha de comando
IF [%1] NEQ [] (
	echo %~1>%temp%\temp.txt
	goto:jmpCpb
)
nircmdc clipboard writefile %temp%\temp.txt

:jmpCpb
youtube-dl -f "best[height<=720][ext=mp4]" --output "%%(title)s.%%(ext)s" -a %temp%\temp.txt
popd
