param(
  [string]$HtmlFile,
  [string]$Route
)

$html = Get-Content $HtmlFile -Raw -Encoding UTF8

# 1. Title
$title = ""
if ($html -match '<title>\s*(.*?)\s*</title>') { $title = $Matches[1].Trim() }

# 2. Page heading (first h3)
$pageHeading = ""
if ($html -match '<h3>\s*(.*?)\s*</h3>') { $pageHeading = $Matches[1].Trim() }

# 3. Forms
$forms = @()
$formMatches = [regex]::Matches($html, '<form[^>]*>([\s\S]*?)</form>')
foreach ($fm in $formMatches) {
  $attrs = $fm.Value.Substring(0, $fm.Value.IndexOf('>') + 1)
  $action = ""; $method = "GET"; $enctype = ""
  if ($attrs -match 'action="([^"]*)"') { $action = $Matches[1] }
  if ($attrs -match 'method="([^"]*)"') { $method = $Matches[1].ToUpper() }
  if ($attrs -match 'enctype="([^"]*)"') { $enctype = $Matches[1] }
  
  $fields = @()
  $inputMatches = [regex]::Matches($fm.Groups[1].Value, '<input[^>]*>')
  foreach ($im in $inputMatches) {
    $iv = $im.Value
    $name = ""; $type = "text"; $placeholder = ""; $id = ""; $value = ""
    if ($iv -match 'name="([^"]*)"') { $name = $Matches[1] }
    if ($iv -match 'type="([^"]*)"') { $type = $Matches[1] }
    if ($iv -match 'placeholder="([^"]*)"') { $placeholder = $Matches[1] }
    if ($iv -match 'id="([^"]*)"') { $id = $Matches[1] }
    if ($iv -match 'value="([^"]*)"') { $value = $Matches[1] }
    $fields += @{ name=$name; type=$type; placeholder=$placeholder; id=$id; value=$value }
  }
  
  $selects = @()
  $selectMatches = [regex]::Matches($fm.Groups[1].Value, '<select[^>]*name="([^"]*)"[^>]*>([\s\S]*?)</select>')
  foreach ($sm in $selectMatches) {
    $opts = @()
    $optMatches = [regex]::Matches($sm.Groups[2].Value, '<option\s*value="([^"]*)"[^>]*>\s*(.*?)\s*</option>')
    foreach ($om in $optMatches) {
      $opts += @{ value=$om.Groups[1].Value; label=$om.Groups[2].Value.Trim() }
    }
    $selects += @{ name=$sm.Groups[1].Value; options=$opts }
  }
  
  $radios = @()
  $radioMatches = [regex]::Matches($fm.Groups[1].Value, 'type="radio"[^>]*name="([^"]*)"[^>]*value="([^"]*)"')
  foreach ($rm in $radioMatches) {
    $radios += @{ name=$rm.Groups[1].Value; value=$rm.Groups[2].Value }
  }
  
  $checkboxes = @()
  $cbMatches = [regex]::Matches($fm.Groups[1].Value, 'type="checkbox"[^>]*name="([^"]*)"[^>]*value="([^"]*)"')
  foreach ($cm in $cbMatches) {
    $checkboxes += @{ name=$cm.Groups[1].Value; value=$cm.Groups[2].Value }
  }
  
  $forms += @{
    action=$action; method=$method; enctype=$enctype
    fields=$fields; selects=$selects; radios=$radios; checkboxes=$checkboxes
  }
}

# 4. AJAX endpoints from JS
$ajaxEndpoints = @()
$ajaxMatches = [regex]::Matches($html, 'url\s*:\s*"([^"]+)"')
foreach ($am in $ajaxMatches) {
  $ep = $am.Groups[1].Value
  if ($ep -ne "" -and $ep -ne "#") { $ajaxEndpoints += $ep }
}
$hrefAjax = [regex]::Matches($html, "href\s*:\s*'([^']+)'")
foreach ($am in $hrefAjax) {
  $ep = $am.Groups[1].Value
  if ($ep -ne "" -and $ep -ne "#") { $ajaxEndpoints += $ep }
}

# 5. All <a href> links
$links = @()
$hrefMatches = [regex]::Matches($html, '<a[^>]*href="([^"]*)"')
foreach ($hm in $hrefMatches) {
  $href = $hm.Groups[1].Value
  if ($href -ne "" -and $href -ne "#" -and $href -notmatch "^javascript:") {
    $links += $href
  }
}

# 6. JavaScript function definitions
$jsFunctions = @()
$funcMatches = [regex]::Matches($html, 'function\s+(\w+)\s*\(')
foreach ($fm in $funcMatches) {
  $jsFunctions += $fm.Groups[1].Value
}

# 7. DataTable columns
$dtColumns = @()
$thMatches = [regex]::Matches($html, '<th>\s*(.*?)\s*</th>')
foreach ($tm in $thMatches) {
  $col = $tm.Groups[1].Value.Trim()
  if ($col -ne "" -and $col -notmatch '<') { $dtColumns += $col }
}

# 8. Inline JS events
$jsEvents = @()
$eventMatches = [regex]::Matches($html, '(onchange|onclick|onsubmit|onload)\s*=\s*"([^"]*)"')
foreach ($em in $eventMatches) {
  $jsEvents += "$($em.Groups[1].Value)=$($em.Groups[2].Value)"
}

# 9. CSS layout classes
$layoutClasses = @()
if ($html -match 'col-md-\d+') {
  $cmatches = [regex]::Matches($html, 'col-md-\d+')
  foreach ($cm in $cmatches) { $layoutClasses += $cm.Value }
}
$layoutClasses = $layoutClasses | Select-Object -Unique

# 10. Session select options (financial years)
$sessionOpts = @()
$batchMatches = [regex]::Matches($html, '<option\s*value="(\d+)"\s*>\s*(\d{4}-\d{4})\s*</option>')
foreach ($bm in $batchMatches) {
  $sessionOpts += @{ value=$bm.Groups[1].Value; label=$bm.Groups[2].Value }
}

# 11. Sidebar navigation
$sidebarNav = @()
$navMatches = [regex]::Matches($html, '<a\s+href="([^"]*)"[^>]*>\s*<i[^>]*class="([^"]*)"[^>]*>\s*</i>\s*([^<]*)')
foreach ($nm in $navMatches) {
  $sidebarNav += @{ href=$nm.Groups[1].Value; icon=$nm.Groups[2].Value; label=$nm.Groups[3].Value.Trim() }
}

# 12. CSS/JS assets loaded
$cssAssets = @()
$jsAssets = @()
$cssMatches = [regex]::Matches($html, 'href="(/static/[^"]*\.css[^"]*)"')
foreach ($cm in $cssMatches) { $cssAssets += $cm.Groups[1].Value }
$jsMatches = [regex]::Matches($html, 'src="(/static/[^"]*\.js[^"]*)"')
foreach ($jm in $jsMatches) { $jsAssets += $jm.Groups[1].Value }

# 13. Image/logo URLs
$images = @()
$imgMatches = [regex]::Matches($html, 'src="(https?://[^"]+\.(jpg|png|gif|svg))"')
foreach ($im in $imgMatches) { $images += $im.Groups[1].Value }

# 14. Modal dialogs
$modals = @()
$modalMatches = [regex]::Matches($html, 'id="(modal[^"]*)"')
foreach ($mm in $modalMatches) { $modals += $mm.Groups[1].Value }

# 15. File upload fields
$uploads = @()
$uploadMatches = [regex]::Matches($html, 'type="file"[^>]*name="([^"]*)"')
foreach ($um in $uploadMatches) { $uploads += $um.Groups[1].Value }

# Build result
$result = [ordered]@{
  route = $Route
  title = $title
  pageHeading = $pageHeading
  forms = $forms
  ajaxEndpoints = $ajaxEndpoints | Select-Object -Unique
  links = $links | Select-Object -Unique
  jsFunctions = $jsFunctions | Select-Object -Unique
  dtColumns = $dtColumns
  jsEvents = $jsEvents | Select-Object -Unique
  layoutClasses = $layoutClasses
  sessionOpts = $sessionOpts
  sidebarNav = $sidebarNav
  cssAssets = $cssAssets | Select-Object -Unique
  jsAssets = $jsAssets | Select-Object -Unique
  images = $images
  modals = $modals
  uploads = $uploads
  htmlSize = (Get-Item $HtmlFile).Length
}

return $result
