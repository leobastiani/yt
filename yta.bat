@ECHO OFF

chcp 65001 > nul

IF %0 == "%~0" (
	rem estou no executar
	pushd %desk%
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
youtube-dl -f "bestaudio[ext=m4a]" --output "%%(title)s.%%(ext)s" -a %temp%\temp.txt

for %%f in (*.m4a) do (
	IF NOT EXIST "%%~nf.mp3" (
		ffmpeg -i "%%f" -codec:a libmp3lame -q:a 2 -vn "%%~nf.mp3"
		del "%%f"
	)
)
popd
