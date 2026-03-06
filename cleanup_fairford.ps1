$filePath = "d:\ccona\cupcakesontheavenue\index.html"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Remove the "Also at Fairford Market" line completely if it wasn't already removed
$content = $content -replace '(\s+)<p style="font-size: 1\.1rem; margin-top: 10px; color: #666;"><strong>Also at Fairford Market:</strong>.*?</p>\s+', "`n"

# Remove any duplicate/corrupted Fairford sections (those with bad encoding)
# Look for the second occurrence that has corrupted characters
$content = $content -replace '<!-- Fairford Market Section -->\s+<section id="market-fairford"[^>]*>\s+<h2>[^<]*ðŸŽª[^<]*Fairford Market.*?</section>\s+', ''

# Save the file
$content | Set-Content -Path $filePath -Encoding UTF8 -Force

Write-Host "Cleaned up duplicate and corrupted sections"
