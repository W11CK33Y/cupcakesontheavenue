$filePath = "d:\ccona\cupcakesontheavenue\index.html"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Create the Fairford Market section
$fairfordSection = @'

<!-- Fairford Market Section -->
<section id="market-fairford" style="background: white; padding: 50px 20px; margin: 40px auto; border-radius: 15px; max-width: 1000px;">
  <h2>🎪 Fairford Market</h2>
  <div style="text-align: center; margin-bottom: 30px;">
    <p style="font-size: 1.3rem; font-weight: bold; color: #667eea;">Every Two Weeks on Wednesday • 9am - 2pm</p>
    <p style="font-size: 1.1rem; margin-top: 10px; color: #666;">Come visit us for fresh bakes, friendly chats, and our famous Shortbread Delight!</p>
    <p style="font-size: 1.1rem; margin-top: 10px; color: #666;">Starting Wednesday 11 March.</p>
  </div>

  <button class="market-toggle" id="fairfordToggle">See This Week's Bakes</button>

  <div class="market-bakes" id="fairfordBakes">
    <div class="products-grid">
      <div class="product-tile">
        <img src="pictures/thisweekshort.jpg" alt="Shortbread Delight">
        <div class="product-overlay">
          <div>
            <div class="product-title">Famous Shortbread Delight ⭐</div>
            <div class="product-description">Our signature buttery shortbread - the star of the market!</div>
          </div>
        </div>
      </div>

      <div class="product-tile">
        <img src="pictures/christmascake.jpg" alt="Brownies">
        <div class="product-overlay">
          <div>
            <div class="product-title">Sliced Christmas cake</div>
            <div class="product-description">Rich and moist, perfect for the festive season.</div>
          </div>
        </div>
      </div>

      <div class="product-tile">
        <img src="pictures/caramelised.jpg" alt="Cupcakes">
        <div class="product-overlay">
          <div>
            <div class="product-title">Caramelised biscuit (Biscoff-style) brownies</div>
            <div class="product-description">Decadent brownies with a caramelised biscuit twist.</div>
          </div>
        </div>
      </div>

      <div class="product-tile">
        <img src="pictures/thisweekiced.jpg" alt="Biscuits">
        <div class="product-overlay">
          <div>
            <div class="product-title">Biscuit Selection</div>
            <div class="product-description">Handmade biscuits perfect for a cosy treat.</div>
          </div>
        </div>
      </div>

      <div class="product-tile">
        <img src="pictures/slicedvanilla.jpg" alt="New Market Bake">
        <div class="product-overlay">
          <div>
            <div class="product-title">Weekly Special</div>
            <div class="product-description">Vanilla sponge with apricot jam — fondant or buttercream topping</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="social-links">
    <p style="font-size: 1.2rem; color: #667eea; font-weight: bold;">Follow us for weekly bakes & updates! 🍪</p>
    <div class="social-icons">
      <a href="https://instagram.com/cupcakesontheavenue" target="_blank">
        <img src="pictures/instagram.png" alt="Instagram" width="45" height="45">
      </a>
      <a href="https://www.facebook.com/profile.php?id=61578246007533" target="_blank">
        <svg width="45" height="45" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a href="https://tiktok.com/@Cupcakesontheheaven" target="_blank">
        <img src="pictures/tiktok.png" alt="TikTok" width="45" height="45">
      </a>
    </div>
  </div>
</section>
'@

# Find where to insert - before the calendar overlay section
# Look for the closing </section> tag of the Highworth market section
# and insert the Fairford section right after it

$insertPattern = '(</section>\s*\n\s*<div class="calendar-overlay")'
$replacement = $fairfordSection + "`n`n`$1"

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $insertPattern, $replacement)

# Save the file
$content | Set-Content -Path $filePath -Encoding UTF8 -Force

Write-Host "Added Fairford Market section"
