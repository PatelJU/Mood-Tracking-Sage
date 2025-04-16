# Script to convert all Markdown files to Word documents
# Uses the full path to Pandoc since it's not in the system PATH

# Full path to Pandoc executable
$pandocPath = "C:\Users\JASH\AppData\Local\Pandoc\pandoc.exe"

# Get all markdown files, excluding node_modules directory
$markdownFiles = Get-ChildItem -Path . -Filter "*.md" -Recurse | Where-Object { $_.FullName -notlike "*\node_modules\*" }

# Create output directory if it doesn't exist
$outputDir = Join-Path -Path (Get-Location) -ChildPath "word-output"
if (-not (Test-Path -Path $outputDir)) {
    New-Item -Path $outputDir -ItemType Directory | Out-Null
    Write-Host "Created output directory: $outputDir"
}

# Counter for tracking conversions
$converted = 0
$errors = 0

Write-Host "Starting conversion of $($markdownFiles.Count) Markdown files to Word format..."

foreach ($file in $markdownFiles) {
    try {
        # Get relative path to preserve directory structure
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        $relativeDir = Split-Path -Path $relativePath -Parent
        
        # Create directory structure in output folder
        $outputSubDir = Join-Path -Path $outputDir -ChildPath $relativeDir
        if (-not (Test-Path -Path $outputSubDir)) {
            New-Item -Path $outputSubDir -ItemType Directory -Force | Out-Null
        }
        
        # Define output file path
        $outputFile = Join-Path -Path $outputSubDir -ChildPath ([System.IO.Path]::GetFileNameWithoutExtension($file.Name) + ".docx")
        
        # Run pandoc to convert the file
        Write-Host "Converting: $relativePath to $outputFile"
        & $pandocPath -f markdown -t docx $file.FullName -o $outputFile
        
        $converted++
    }
    catch {
        Write-Host "Error converting $($file.FullName): $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`nConversion completed: $converted files converted, $errors errors" -ForegroundColor Green
Write-Host "Word documents are available in: $outputDir" 