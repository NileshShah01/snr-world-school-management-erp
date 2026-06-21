$raw = Get-Content "D:\Snredu\Educationdesk\99_RAW\routes.json" -Raw | ConvertFrom-Json
$sessData = Get-Content "D:\Snredu\Educationdesk\99_RAW\session.json" -Raw | ConvertFrom-Json
$root = "https://apexps.educationdesk.in"
$outBase = "D:\Snredu\Educationdesk"

$allRoutes = @()
foreach ($m in $raw.PSObject.Properties) {
  foreach ($r in $m.Value.PSObject.Properties) {
    $allRoutes += @{ route = $r.Name; file = $r.Value }
  }
}

"Fetching $($allRoutes.Count) routes in parallel batches of 20..."
$batchSize = 20
$fetched = 0
$errors = 0

for ($i = 0; $i -lt $allRoutes.Count; $i += $batchSize) {
  $end = [Math]::Min($i + $batchSize - 1, $allRoutes.Count - 1)
  $batch = $allRoutes[$i..$end]
  $jobs = @()
  
  foreach ($item in $batch) {
    $scriptBlock = {
      param($url, $outFile, $jsid, $edk)
      $sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
      [void]$sess.Cookies.Add((New-Object System.Net.Cookie("JSESSIONID", $jsid, "/", "apexps.educationdesk.in")))
      [void]$sess.Cookies.Add((New-Object System.Net.Cookie("EDKEMPSESSION_", $edk, "/", "apexps.educationdesk.in")))
      $h = @{ "Referer" = "https://apexps.educationdesk.in/employee/home"; "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      try {
        $r = Invoke-WebRequest -Uri $url -WebSession $sess -Headers $h -UseBasicParsing -TimeoutSec 30
        $dir = Split-Path $outFile -Parent
        if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        Set-Content -Path $outFile -Value $r.Content -Encoding UTF8
        return "OK  $($r.StatusCode)  $($r.Content.Length)  $url"
      } catch {
        $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        return "ERR $code  $($_.Exception.Message.Substring(0,[Math]::Min(50,$_.Exception.Message.Length)))  $url"
      }
    }
    
    # Add /employee/ prefix for relative routes
    $routePath = $item.route
    if ($routePath -notmatch "^/") { $routePath = "/employee/$routePath" }
    $url = "$root$routePath"
    $outPath = Join-Path $outBase $item.file
    $jobs += Start-Job -ScriptBlock $scriptBlock -ArgumentList $url, $outPath, $sessData.JSESSIONID, $sessData.EDKEMPSESSION_
  }
  
  $batchResults = $jobs | Wait-Job -Timeout 90 | Receive-Job
  foreach ($res in $batchResults) {
    if ($res -match "^OK") { $fetched++ } else { $errors++ }
    Write-Output $res
  }
  $jobs | Remove-Job -Force -ErrorAction SilentlyContinue
  Write-Output "Batch done: $fetched OK, $errors ERR"
}
Write-Output "=== COMPLETE: $fetched fetched, $errors errors ==="
