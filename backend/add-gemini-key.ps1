# Add Gemini API Key to .env File

Write-Host "Adding Gemini API key to .env file..." -ForegroundColor Cyan

$envFile = "c:\Users\POLAPALLY MANOJKUMAR\Videos\NEW PS\AI---Based-Personal-Trainer\backend\.env"
$apiKey = "GEMINI_API_KEY=AIzaSyBdHNcP_TKqgoRVws_L-4facmS3c8oUXB0"

# Check if .env file exists
if (Test-Path $envFile) {
    # Read current content
    $content = Get-Content $envFile -Raw
    
    # Check if GEMINI_API_KEY already exists
    if ($content -match "GEMINI_API_KEY") {
        Write-Host "GEMINI_API_KEY already exists in .env file. Updating..." -ForegroundColor Yellow
        # Replace existing key
        $content = $content -replace "GEMINI_API_KEY=.*", $apiKey
        Set-Content -Path $envFile -Value $content -NoNewline
    } else {
        Write-Host "Adding GEMINI_API_KEY to .env file..." -ForegroundColor Green
        # Append new key
        Add-Content -Path $envFile -Value "`n$apiKey"
    }
    
    Write-Host "Success - Gemini API key added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The API key has been added to:" -ForegroundColor Cyan
    Write-Host $envFile -ForegroundColor White
} else {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    Write-Host "Please create the .env file first" -ForegroundColor Yellow
}
