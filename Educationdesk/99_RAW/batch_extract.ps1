# Batch processor: extract from all raw HTML -> JSON
$raw = Get-Content "D:\Snredu\Educationdesk\99_RAW\routes.json" -Raw | ConvertFrom-Json
$base = "D:\Snredu\Educationdesk"
$jsonDir = "$base\99_RAW\extracted"
if (!(Test-Path $jsonDir)) { New-Item -ItemType Directory -Path $jsonDir -Force | Out-Null }

# Add types for HTML parsing
Add-Type -AssemblyName System.Web

$total = 0; $ok = 0; $err = 0

foreach ($m in $raw.PSObject.Properties) {
  foreach ($r in $m.Value.PSObject.Properties) {
    $total++
    $route = $r.Name
    $file = $r.Value
    $htmlPath = Join-Path $base $file
    $jsonFile = "$jsonDir\$($m.Name)_$($route -replace '[^a-zA-Z0-9]','_').json"
    
    if (!(Test-Path $htmlPath)) {
      "SKIP $route (file not found)"
      $err++
      continue
    }
    
    try {
      $data = & "D:\Snredu\Educationdesk\99_RAW\extract.ps1" -HtmlFile $htmlPath -Route $route
      $data | ConvertTo-Json -Depth 5 | Set-Content $jsonFile -Encoding UTF8
      "OK   $route  forms=$($data.forms.Count) ajax=$($data.ajaxEndpoints.Count) links=$($data.links.Count) jsFunc=$($data.jsFunctions.Count) cols=$($data.dtColumns.Count)"
      $ok++
    } catch {
      "ERR  $route  $($_.Exception.Message.Substring(0,[Math]::Min(60,$_.Exception.Message.Length)))"
      $err++
    }
  }
}
"=== DONE: $ok/$total ok, $err errors ==="
