param(
  [string]$Route = "",
  [string]$OutFile = "",
  [int]$Timeout = 30
)

$root = "https://apexps.educationdesk.in"
$url = "$root$Route"
$sessionFile = "D:\Snredu\Educationdesk\99_RAW\session.json"

# Load cookies
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
  $r = Invoke-WebRequest -Uri $url -WebSession $sess -Headers $headers -UseBasicParsing -TimeoutSec $Timeout
  $status = $r.StatusCode
  $finalUrl = $r.BaseResponse.ResponseUri.AbsoluteUri
  $len = $r.Content.Length
  if ($OutFile -ne "") {
    $dir = Split-Path $OutFile -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Set-Content -Path $OutFile -Value $r.Content -Encoding UTF8
  }
  Write-Output "OK  $status  $len  $Route"
} catch {
  $err = $_.Exception.Message
  Write-Output "ERR $err  $Route"
}
