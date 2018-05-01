#requires -version 2

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$folder = Join-Path -Path $pwd -ChildPath "source"
$docx = Join-Path -Path $pwd -ChildPath "thesis.docx"
$pdf = Join-Path -Path $pwd -ChildPath "thesis.pdf"

Write-Host "Creating docx from folder."
[System.IO.Compression.ZipFile]::CreateFromDirectory($folder, $docx)

Write-Host "Running MS Word with docx."
$proc = Start-Process -FilePath "$Env:PROGRAMFILES\Microsoft Office\Office16\WINWORD.EXE" -PassThru -ArgumentList $docx
Wait-Process -InputObject $proc

if ($proc.ExitCode -ne 0) {
    Write-Warning "$_ exited with status code $($proc.ExitCode)"
} else {
	
	Write-Host "Remove old thesis folder."
	Remove-Item -Path "source" -Recurse
	
	Write-Host "Extract docx content to folder."
	[System.IO.Compression.ZipFile]::ExtractToDirectory($docx, $folder)
		
	Write-Host "Remove docx file."
	Remove-Item -Path $docx
}
