$filePath = "d:\ccona\cupcakesontheavenue\index.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Remove the "Also at Fairford Market" paragraph line from Highworth section
$content = $content -replace '    <p style="font-size: 1\.1rem; margin-top: 10px; color: #666;"><strong>Also at Fairford Market:</strong>.*?</p>\s*', ""

# Now save it
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)

Write-Host "Removed 'Also at Fairford Market' line from Highworth section"
