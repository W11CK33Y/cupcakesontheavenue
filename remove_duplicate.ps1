$filePath = "d:\ccona\cupcakesontheavenue\index.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Remove the entire corrupted Fairford section that contains bad encoding
# This regex looks for the comment and section with corrupted characters
$pattern = '<!-- Fairford Market Section -->\s*<section id="market-fairford"[^>]*>.*?</section>\s*</section>'
$content = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, '', [System.Text.RegularExpressions.RegexOptions]::Singleline)

# Save the file
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)

Write-Host "Removed corrupted duplicate Fairford section"
