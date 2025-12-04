#!/usr/bin/env pwsh
# Comprehensive Functionality Test Script - Simplified

$API_BASE = "http://localhost:5000/api"
$passed = @()
$failed = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body,
        [string]$Token
    )
    
    $headers = @{"Content-Type" = "application/json"}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    try {
        $params = @{
            Uri = "$API_BASE$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 10) }
        
        $response = Invoke-WebRequest @params
        Write-Host "✅ $Name - PASSED" -ForegroundColor Green
        $script:passed += $Name
        return $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "❌ $Name - FAILED" -ForegroundColor Red
        $script:failed += $Name
        return $null
    }
}

Write-Host "`n🚀 Starting Comprehensive Functionality Tests...`n" -ForegroundColor Magenta

# ===== AUTHENTICATION TESTS =====
Write-Host "=== TESTING AUTHENTICATION ===" -ForegroundColor Cyan

$timestamp = Get-Date -UFormat %s
$memberRes = Test-Endpoint "Member Registration" "POST" "/auth/register" @{
    username = "testmember_$timestamp"
    email = "testmember_$timestamp@test.com"
    password = "Test@12345"
    role = "member"
}
$memberToken = $memberRes.token
$memberId = $memberRes.data._id

$trainerRes = Test-Endpoint "Trainer Registration" "POST" "/auth/register" @{
    username = "testtrainer_$timestamp"
    email = "testtrainer_$timestamp@test.com"
    password = "Test@12345"
    role = "trainer"
}
$trainerToken = $trainerRes.token
$trainerId = $trainerRes.data._id

Test-Endpoint "User Login" "POST" "/auth/login" @{
    email = "testmember_$timestamp@test.com"
    password = "Test@12345"
} | Out-Null

# ===== MEMBER FEATURES =====
Write-Host "`n=== TESTING MEMBER FEATURES ===" -ForegroundColor Cyan

if ($memberToken) {
    Test-Endpoint "Get Member Profile" "GET" "/members/profile" $null $memberToken | Out-Null
    
    Test-Endpoint "Update Member Profile" "PUT" "/members/profile" @{
        firstName = "Test"
        lastName = "Member"
        age = 25
        gender = "male"
        fitnessLevel = "beginner"
        goals = @("muscle gain")
    } $memberToken | Out-Null
    
    if ($trainerId) {
        Test-Endpoint "Assign Trainer" "PUT" "/members/assign-trainer" @{
            trainerId = $trainerId
        } $memberToken | Out-Null
    }
    
    Test-Endpoint "Get Member Progress" "GET" "/members/progress" $null $memberToken | Out-Null
}

# ===== TRAINER FEATURES =====
Write-Host "`n=== TESTING TRAINER FEATURES ===" -ForegroundColor Cyan

if ($trainerToken) {
    Test-Endpoint "Get All Trainers" "GET" "/trainers" $null $trainerToken | Out-Null
    Test-Endpoint "Get Assigned Clients" "GET" "/trainers/clients" $null $trainerToken | Out-Null
}

# ===== WORKOUT FEATURES =====
Write-Host "`n=== TESTING WORKOUT FEATURES ===" -ForegroundColor Cyan

if ($memberToken) {
    $workoutRes = Test-Endpoint "Create Workout" "POST" "/workouts" @{
        exercises = @("Push ups")
        sets = 3
        reps = 15
        totalDuration = 30
        totalCalories = 250
        date = [datetime]::UtcNow.ToString("o")
        notes = "Test"
    } $memberToken
    $workoutId = $workoutRes.data._id
    
    Test-Endpoint "Get All Workouts" "GET" "/workouts" $null $memberToken | Out-Null
    
    if ($workoutId) {
        Test-Endpoint "Get Single Workout" "GET" "/workouts/$workoutId" $null $memberToken | Out-Null
    }
}

# ===== EXERCISE FEATURES =====
Write-Host "`n=== TESTING EXERCISE FEATURES ===" -ForegroundColor Cyan

if ($memberToken) {
    Test-Endpoint "Get All Exercises" "GET" "/exercises" $null $memberToken | Out-Null
}

# ===== REPORT =====
$total = $passed.Count + $failed.Count
$percentage = if ($total -gt 0) { [math]::Round(($passed.Count / $total) * 100, 2) } else { 0 }

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    COMPREHENSIVE FUNCTIONALITY REPORT    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✅ PASSED: $($passed.Count)" -ForegroundColor Green
$passed | ForEach-Object { Write-Host "   ✅ $_" -ForegroundColor Green }

Write-Host "`n❌ FAILED: $($failed.Count)" -ForegroundColor Red
$failed | ForEach-Object { Write-Host "   ❌ $_" -ForegroundColor Red }

Write-Host "`n📊 SUCCESS RATE: $percentage% ($($passed.Count)/$total)`n" -ForegroundColor Cyan

if ($failed.Count -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! The app is working correctly.`n" -ForegroundColor Green
}
else {
    Write-Host "⚠️  $($failed.Count) test(s) failed. Check the errors above.`n" -ForegroundColor Yellow
}

Write-Host "✨ Test suite completed!`n" -ForegroundColor Magenta
