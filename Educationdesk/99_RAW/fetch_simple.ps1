param(
  [string]$Route,
  [string]$OutFile
)
$root = "https://apexps.educationdesk.in"
$url = "$root$Route"
$sessionFile = "D:\Snredu\Educationdesk\99_RAW\session.json"

$sessData = Get-Content $sessionFile -Raw | ConvertFrom-Json
$sess = New-Object Microsoft.PowerShell.Commands.WebRequestSession
[void]$sess.Cookies.Add((New-Object System.Net.Cookie("JSESSIONID", $sessData.JSESSIONID, "/", "apexps.educationdesk.in")))
[void]$sess.Cookies.Add((New-Object System.Net.Cookie("EDKEMPSESSION_", $sessData.EDKEMPSESSION_, "/", "apexps.educationdesk.in")))

$headers = @{
  "Referer" = "https://apexps.educationdesk.in/employee/home"
  "Accept"  = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
}

try {
  $r = Invoke-WebRequest -Uri $url -WebSession $sess -Headers $headers -UseBasicParsing -TimeoutSec 30
  $dir = Split-Path $OutFile -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Set-Content -Path $OutFile -Value $r.Content -Encoding UTF8
  Write-Output ("OK  {0,5}  {1,7}  {2}" -f $r.StatusCode, $r.Content.Length, $Route)
} catch {
  $err = $_.Exception.Message
  if ($_.Exception.Response) {
    $sc = $_.Exception.Response.StatusCode.value__
    Write-Output ("ERR {0,5}  {1,7}  {2}" -f $sc, 0, $Route)
  } else {
    Write-Output ("ERR ----  {0,7}  {1}  {2}" -f 0, $Route, $err.Substring(0, [Math]::Min(60,$err.Length)))
  }
}
