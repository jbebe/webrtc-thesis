#requires -version 2

function GetXml {
	[xml]$xml = Get-Content $xmlPath -Encoding UTF8
	[System.Xml.XmlNamespaceManager]$ns = $xml.NameTable
	$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
	$xml.PreserveWhitespace = $true
	$queryNonEmptyTextNodes = '//w:t[string-length(text()) > 0 and not(text()[not(normalize-space())])]/node()'
	@{
		Nodes=$xml.SelectNodes($queryNonEmptyTextNodes, $ns)
		Handle=$xml
	}
}

function MergeFragments {
	$lines = [string[]](Get-Content -Path $textPath)
	
	$counter = 0
	$xml = GetXml
	foreach ($node in $xml.Nodes){
		$node.Value = $lines[$counter]
		$counter += 1
	}

	Write-Host "Update document.xml"
	$xml.Handle.Save($xmlPath)
	Write-Host "Delete raw.txt"
	Remove-Item -Path $textPath
}

function CreateFragments {
	$lines = [System.Collections.Generic.List[System.String]]@()
	$xml = GetXml
	foreach ($node in $xml.Nodes){
		$val = $node.Value
		$lines.Add($val)
		$node.Value = "$"
	}

	Set-Content -Value ([System.String]::Join("`n", $lines)) -Path $textPath -Encoding UTF8
	Write-Host "Update document.xml"
	$xml.Handle.Save($xmlPath)
}

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$folder = Join-Path -Path $pwd -ChildPath "source"
$docx = Join-Path -Path $pwd -ChildPath "thesis.docx"
$pdf = Join-Path -Path $pwd -ChildPath "thesis.pdf"

Write-Host "Load text from raw.txt to document.xml"
MergeFragments

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

Write-Host "Creating raw.txt and filling document.xml with placeholders"
CreateFragments