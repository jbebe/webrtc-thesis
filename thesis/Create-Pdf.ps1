#requires -version 2

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$folder = Join-Path -Path $pwd -ChildPath "source"
$docx = Join-Path -Path $pwd -ChildPath "thesis.docx"
$pdf = Join-Path -Path $pwd -ChildPath "thesis.pdf"

Write-Host "Creating docx from folder."
[System.IO.Compression.ZipFile]::CreateFromDirectory($folder, $docx)

Write-Host "Generate pdf from docx file."
$wordApp = New-Object -ComObject Word.Application
$document = $wordApp.Documents.Open($docx)
$document.SaveAs([ref][string]$pdf, [ref] 17)
$document.Close()
$wordApp.Quit()

Write-Host "Remove docx file."
Remove-Item -Path $docx