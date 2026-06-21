# Parallel fetcher using PowerShell jobs
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

"Fetching $($allRoutes.Count) routes in batches of 15..."
$batchSize = 15
$results = @()

for ($i = 0; $i -lt $allRoutes.Count; $i += $batchSize) {
  $batch = $allRoutes[$i..([Math]::Min($i + $batchSize - 1, $allRoutes.Count - 1))]
  $jobs = @()
  
  foreach ($item in $batch) {
    $scriptBlock = {
      param($url, $outFile, $jsid, $edk)
      $sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
      [void]$sess.Cookies.Add((New-Object System.Net.Cookie("JSESSIONID", $jsid, "/", "apexps.educationdesk.in")))
      [void]$sess.Cookies.Add((New-Object System.Net.Cookie("EDKEMPSESSION_", $edk, "/", "apexps.educationdesk.in")))
      $h = @{
        "Referer" = "https://apexps.educationdesk.in/employee/home"
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
      try {
        $r = Invoke-WebRequest -Uri $url -WebSession $sess -Headers $h -UseBasicParsing -TimeoutSec 30
        $dir = Split-Path $outFile -Parent
        if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        Set-Content -Path $outFile -Value $r.Content -Encoding UTF8
        return "OK  $($r.StatusCode)  $($r.Content.Length)  $($url)"
      } catch {
        $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        return "ERR $code  $($_.Exception.Message.Substring(0,[Math]::Min(50,$_.Exception.Message.Length)))  $($url)"
      }
    }
    
    $url = "$root$($item.route)"
    $outPath = Join-Path $outBase $item.file
    $jobs += Start-Job -ScriptBlock $scriptBlock -ArgumentList $url, $outPath, $sessData.JSESSIONID, $sessData.EDKEMPSESSION_
  }
  
  $batchResults = $jobs | Wait-Job -Timeout 60 | Receive-Job
  $batchResults | ForEach-Object { $_ }
  $jobs | Remove-Job -Force -ErrorAction SilentlyContinue
}

"Done fetching all routes."
