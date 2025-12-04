#!/usr/bin/env powershell

# Redis & Real-Time Setup Script for AI Personal Trainer
# This script sets up and starts all services needed for the application

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "AI Trainer - Redis Real-Time Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Redis is available
Write-Host "Checking for Redis..." -ForegroundColor Yellow
$redisCheck = docker --version 2>$null

if ($redisCheck) {
    Write-Host "✓ Docker found" -ForegroundColor Green
    
    # Start Redis container
    Write-Host "Starting Redis container..." -ForegroundColor Yellow
    docker run -d -p 6379:6379 --name redis-trainer redis:7-alpine 2>$null
    
    if ($?) {
        Write-Host "✓ Redis container started" -ForegroundColor Green
    }
    else {
        # Container might already exist, try starting it
        docker start redis-trainer 2>$null
        Write-Host "✓ Redis container started" -ForegroundColor Green
    }
}
else {
    Write-Host "⚠ Docker not found. Redis should be running separately." -ForegroundColor Yellow
    Write-Host "  Run: redis-server.exe or docker run -d -p 6379:6379 --name redis-trainer redis:7-alpine" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
$backendPath = "backend"

if (Test-Path $backendPath) {
    Set-Location $backendPath
    npm install
    if ($?) {
        Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    }
    Set-Location ..
}
else {
    Write-Host "✗ Backend directory not found at: $backendPath" -ForegroundColor Red
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
$frontendPath = "frontend"

if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    npm install
    if ($?) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    }
    Set-Location ..
}
else {
    Write-Host "✗ Frontend directory not found at: $frontendPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Terminal 1 - Verify Redis is running" -ForegroundColor White
Write-Host "   docker exec redis-trainer redis-cli ping" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open Terminal 2 - Start Backend" -ForegroundColor White
Write-Host "   cd backend && npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open Terminal 3 - Start Frontend" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open browser to: http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  Backend API:     http://localhost:8000" -ForegroundColor Gray
Write-Host "  Frontend:        http://localhost:5174" -ForegroundColor Gray
Write-Host "  Redis:           localhost:6379" -ForegroundColor Gray
Write-Host "  Socket.IO:       ws://localhost:8000" -ForegroundColor Gray
Write-Host ""
