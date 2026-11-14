# =====================================================================
# ARENA X Render Cloud Bot - 24/7 Keep-Alive Background Pinger
# =====================================================================
# This script pings https://bd-battle-pro.onrender.com/health every 8 minutes
# to guarantee Render Never spins down.
# =====================================================================

$url = "https://bd-battle-pro.onrender.com/health"
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🟢 ARENA X 24/7 Keep-Alive Background Pinger Started" -ForegroundColor Green
Write-Host "Target URL: $url" -ForegroundColor Cyan
Write-Host "Interval: Every 8 minutes (480 seconds)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    try {
        $res = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 45
        Write-Host "[$timestamp] ✓ PING SUCCESS - Status: $($res.status), Bot: $($res.botStatus), Uptime: $($res.uptime)s" -ForegroundColor Green
    } catch {
        Write-Host "[$timestamp] ⚠️ PING WARNING: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 480
}
