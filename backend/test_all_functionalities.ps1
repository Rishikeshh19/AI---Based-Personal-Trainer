#!/usr/bin/env pwsh
# Comprehensive Functionality Test Script for Member and Trainer

$API_BASE = "http://localhost:5000/api"
$results = @{
    passed = @()
    failed = @()
}

function Make-Request {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{"Content-Type" = "application/json"}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $uri = "$API_BASE$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        return @{
            StatusCode = $response.StatusCode
            Body = $response.Content | ConvertFrom-Json
        }
    }
    catch {
    catch {
            $errorMsg = ""
            try {
                if ($_.Exception.Response.Content) {
                    $errorMsg = $_.Exception.Response.Content | ConvertFrom-Json
                }
            }
            catch { }
            
            return @{
                StatusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
                Body = @{message = $errorMsg.message -or $_.Exception.Message}
                Error = $true
            }
        }
    }
}

function Test-Authentication {
    Write-Host "`n=== TESTING AUTHENTICATION ===" -ForegroundColor Cyan
    
    # Register Member
    $timestamp = Get-Date -UFormat %s
    $memberEmail = "testmember_$timestamp@test.com"
    $trainerEmail = "testtrainer_$timestamp@test.com"
    
    $res = Make-Request "POST" "/auth/register" @{
        username = "testmember_$timestamp"
        email = $memberEmail
        password = "Test@12345"
        role = "member"
    }
    
    if ($res.StatusCode -eq 200 -and $res.Body.token) {
        Write-Host "✅ Member Registration - PASSED" -ForegroundColor Green
        $results.passed += "Member Registration"
        $global:memberToken = $res.Body.token
        $global:memberId = $res.Body.data._id
    }
    else {
        Write-Host "❌ Member Registration - FAILED" -ForegroundColor Red
        $results.failed += "Member Registration"
    }
    
    # Register Trainer
    $res = Make-Request "POST" "/auth/register" @{
        username = "testtrainer_$timestamp"
        email = $trainerEmail
        password = "Test@12345"
        role = "trainer"
    }
    
    if ($res.StatusCode -eq 200 -and $res.Body.token) {
        Write-Host "✅ Trainer Registration - PASSED" -ForegroundColor Green
        $results.passed += "Trainer Registration"
        $global:trainerToken = $res.Body.token
        $global:trainerId = $res.Body.data._id
    }
    else {
        Write-Host "❌ Trainer Registration - FAILED: $($res.Body.message)" -ForegroundColor Red
        $results.failed += "Trainer Registration"
    }
    
    # Test Login with Member credentials
    $res = Make-Request "POST" "/auth/login" @{
        email = $memberEmail
        password = "Test@12345"
    }
    
    if ($res.StatusCode -eq 200 -and $res.Body.token) {
        Write-Host "✅ User Login - PASSED" -ForegroundColor Green
        $results.passed += "User Login"
        $global:memberToken = $res.Body.token
    }
    else {
        Write-Host "❌ User Login - FAILED: $($res.Body.message)" -ForegroundColor Red
        $results.failed += "User Login"
    }
}

function Test-MemberFeatures {
    Write-Host "`n=== TESTING MEMBER FEATURES ===" -ForegroundColor Cyan
    
    if (-not $global:memberToken) {
        Write-Host "⚠️  Skipping member tests - no valid token" -ForegroundColor Yellow
        return
    }
    
    # Get Member Profile
    $res = Make-Request "GET" "/members/profile" -Token $global:memberToken
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Get Member Profile - PASSED" -ForegroundColor Green
        $results.passed += "Get Member Profile"
    }
    else {
        Write-Host "❌ Get Member Profile - FAILED" -ForegroundColor Red
        $results.failed += "Get Member Profile"
    }
    
    # Update Member Profile
    $res = Make-Request "PUT" "/members/profile" @{
        firstName = "Test"
        lastName = "Member"
        age = 25
        gender = "male"
        fitnessLevel = "beginner"
        goals = @("muscle gain", "strength")
    } -Token $global:memberToken
    
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Update Member Profile - PASSED" -ForegroundColor Green
        $results.passed += "Update Member Profile"
    }
    else {
        Write-Host "❌ Update Member Profile - FAILED" -ForegroundColor Red
        $results.failed += "Update Member Profile"
    }
    
    # Assign Trainer
    if ($global:trainerId) {
        $res = Make-Request "PUT" "/members/assign-trainer" @{
            trainerId = $global:trainerId
        } -Token $global:memberToken
        
        if ($res.StatusCode -eq 200) {
            Write-Host "✅ Assign Trainer to Member - PASSED" -ForegroundColor Green
            $results.passed += "Assign Trainer to Member"
        }
        else {
            Write-Host "❌ Assign Trainer to Member - FAILED" -ForegroundColor Red
            $results.failed += "Assign Trainer to Member"
        }
    }
    
    # Get Member Progress
    $res = Make-Request "GET" "/members/progress" -Token $global:memberToken
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Get Member Progress - PASSED" -ForegroundColor Green
        $results.passed += "Get Member Progress"
    }
    else {
        Write-Host "❌ Get Member Progress - FAILED" -ForegroundColor Red
        $results.failed += "Get Member Progress"
    }
}

function Test-TrainerFeatures {
    Write-Host "`n=== TESTING TRAINER FEATURES ===" -ForegroundColor Cyan
    
    if (-not $global:trainerToken) {
        Write-Host "⚠️  Skipping trainer tests - no valid token" -ForegroundColor Yellow
        return
    }
    
    # Get All Trainers
    $res = Make-Request "GET" "/trainers" -Token $global:trainerToken
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Get All Trainers - PASSED" -ForegroundColor Green
        $results.passed += "Get All Trainers"
    }
    else {
        Write-Host "❌ Get All Trainers - FAILED" -ForegroundColor Red
        $results.failed += "Get All Trainers"
    }
    
    # Get Assigned Clients
    $res = Make-Request "GET" "/trainers/clients" -Token $global:trainerToken
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Get Assigned Clients - PASSED" -ForegroundColor Green
        $results.passed += "Get Assigned Clients"
    }
    else {
        Write-Host "❌ Get Assigned Clients - FAILED" -ForegroundColor Red
        $results.failed += "Get Assigned Clients"
    }
}

function Test-WorkoutFeatures {
    Write-Host "`n=== TESTING WORKOUT FEATURES ===" -ForegroundColor Cyan
    
    if (-not $global:memberToken) {
        Write-Host "⚠️  Skipping workout tests - no valid token" -ForegroundColor Yellow
        return
    }
    
    # Create Workout
    $res = Make-Request "POST" "/workouts" @{
        exercises = @("Push ups", "Squats")
        sets = 3
        reps = 15
        totalDuration = 30
        totalCalories = 250
        date = [datetime]::UtcNow.ToString("o")
        notes = "Test workout"
    } -Token $global:memberToken
    
    if ($res.StatusCode -eq 201 -or $res.StatusCode -eq 200) {
        Write-Host "✅ Create Workout - PASSED" -ForegroundColor Green
        $results.passed += "Create Workout"
        $global:workoutId = $res.Body.data._id
    }
    else {
        Write-Host "❌ Create Workout - FAILED: $($res.Body.message)" -ForegroundColor Red
        $results.failed += "Create Workout"
    }
    
    # Get All Workouts
    $res = Make-Request "GET" "/workouts" -Token $global:memberToken
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Get All Workouts - PASSED" -ForegroundColor Green
        $results.passed += "Get All Workouts"
    }
    else {
        Write-Host "❌ Get All Workouts - FAILED" -ForegroundColor Red
        $results.failed += "Get All Workouts"
    }
    
    # Get Single Workout
    if ($global:workoutId) {
        $res = Make-Request "GET" "/workouts/$($global:workoutId)" -Token $global:memberToken
        if ($res.StatusCode -eq 200) {
            Write-Host "✅ Get Single Workout - PASSED" -ForegroundColor Green
            $results.passed += "Get Single Workout"
        }
        else {
            Write-Host "❌ Get Single Workout - FAILED" -ForegroundColor Red
            $results.failed += "Get Single Workout"
        }
    }
}

function Test-ExerciseFeatures {
    Write-Host "`n=== TESTING EXERCISE FEATURES ===" -ForegroundColor Cyan
    
    if (-not $global:memberToken) {
        Write-Host "⚠️  Skipping exercise tests - no valid token" -ForegroundColor Yellow
        return
    }
    
    # Get All Exercises
    $res = Make-Request "GET" "/exercises" -Token $global:memberToken
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Get All Exercises - PASSED" -ForegroundColor Green
        $results.passed += "Get All Exercises"
    }
    else {
        Write-Host "❌ Get All Exercises - FAILED" -ForegroundColor Red
        $results.failed += "Get All Exercises"
    }
}

function Generate-Report {
    Write-Host "`n`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║    COMPREHENSIVE FUNCTIONALITY REPORT    ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    Write-Host "✅ PASSED: $($results.passed.Count)" -ForegroundColor Green
    foreach ($test in $results.passed) {
        Write-Host "   ✅ $test" -ForegroundColor Green
    }
    
    Write-Host "`n❌ FAILED: $($results.failed.Count)" -ForegroundColor Red
    foreach ($test in $results.failed) {
        Write-Host "   ❌ $test" -ForegroundColor Red
    }
    
    $totalTests = $results.passed.Count + $results.failed.Count
    if ($totalTests -gt 0) {
        $passPercentage = [math]::Round(($results.passed.Count / $totalTests) * 100, 2)
    }
    else {
        $passPercentage = 0
    }
    
    Write-Host "`n📊 SUCCESS RATE: $passPercentage% ($($results.passed.Count)/$totalTests)`n" -ForegroundColor Cyan
    
    if ($results.failed.Count -eq 0) {
        Write-Host "🎉 ALL TESTS PASSED! The app is working correctly.`n" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Some tests failed. Please review the errors above.`n" -ForegroundColor Yellow
    }
}

# Run all tests
Write-Host "🚀 Starting Comprehensive Functionality Tests...`n" -ForegroundColor Magenta

Test-Authentication
Test-MemberFeatures
Test-TrainerFeatures
Test-WorkoutFeatures
Test-ExerciseFeatures
Generate-Report

Write-Host "`n✨ Test suite completed!" -ForegroundColor Magenta
