
$filePath = "d:\ccona\cupcakesontheavenue\index.html"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Remove duplicate Fairford section by looking for the second </section> after </section> with bad encoding
# Find and remove the corrupted section starting with "<!-- Fairford Market Section" containing "ðŸŽª"

$lines = $content -split "`n"
$newLines = @()
$skipMode = $false
$skipCount = 0

foreach ($line in $lines) {
    # Check if this is the start of the corrupted Fairford section
    if ($line -match "<!-- Fairford Market Section -->" -and $skipMode -eq $false) {
        # Check if the next few lines contain corrupted characters
        $checkIndex = $lines.IndexOf($line)
        if ($checkIndex -lt $lines.Length - 2) {
            $nextLine = $lines[$checkIndex + 1]
            if ($nextLine -match "ðŸŽª|â€•|âœ") {
                # This is the corrupted section, start skipping
                $skipMode = $true
                $skipCount = 0
                continue
            }
        }
    }
    
    # If we're in skip mode, look for the end of this section
    if ($skipMode) {
        if ($line -match "</section>") {
            $skipCount++
            if ($skipCount -eq 1) {
                # Skip this closing section tag and don't add following empty section tag
                $skipMode = $false
                continue
            }
        }
        if ($skipMode) {
            continue
        }
    }
    
    # Also remove the "Also at Fairford Market" line if it's still there
    if ($line -match '<strong>Also at Fairford Market:</strong>') {
        continue
    }
    
    $newLines += $line
}

$content = $newLines -join "`n"

# Save the file
$content | Set-Content -Path $filePath -Encoding UTF8 -Force

Write-Host "Cleaned up:"
Write-Host "- Removed corrupted duplicate Fairford section"
Write-Host "- Removed 'Also at Fairford Market' line from Highworth section"
