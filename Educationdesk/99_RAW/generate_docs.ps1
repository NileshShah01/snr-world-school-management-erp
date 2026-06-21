$base = "D:\Snredu\Educationdesk"
$jsonDir = "$base\99_RAW\extracted"
$raw = Get-Content "$base\99_RAW\routes.json" -Raw | ConvertFrom-Json
$jsonFiles = Get-ChildItem "$jsonDir\*.json"
$generated = 0

foreach ($jf in $jsonFiles) {
  try {
    $json = Get-Content $jf.FullName -Raw | ConvertFrom-Json
    $route = $json.route
    
    # Find module
    $moduleName = ""
    foreach ($m in $raw.PSObject.Properties) {
      if ($m.Value.PSObject.Properties[$route]) {
        $moduleName = $m.Name
        break
      }
    }
    if ($moduleName -eq "") { continue }
    
    $folder = "$base\$moduleName"
    $fileName = $route -replace '[^a-zA-Z0-9]','_'
    $mdPath = "$folder\$fileName.md"
    
    # Build markdown content
    $lines = @()
    $lines += "# " + $json.pageHeading
    $lines += ""
    $lines += "Route: /employee/" + $json.route
    $lines += ""
    $lines += "Title: " + $json.title
    $lines += ""
    $lines += "HTML Size: " + [Math]::Round($json.htmlSize / 1024, 1).ToString() + " KB"
    $lines += ""
    
    # Forms
    if ($json.forms.Count -gt 0) {
      $lines += "## Forms"
      $lines += ""
      $fi = 0
      foreach ($form in $json.forms) {
        $fi++
        $lines += "### Form " + $fi.ToString()
        $lines += "- Action: " + $form.action
        $lines += "- Method: " + $form.method
        if ($form.enctype) { $lines += "- Enctype: " + $form.enctype }
        $lines += ""
        if ($form.fields.Count -gt 0) {
          $lines += "#### Input Fields"
          $lines += "| Name | Type | Placeholder | Default |"
          $lines += "|------|------|-------------|---------|"
          foreach ($f in $form.fields) {
            $lines += "| " + $f.name + " | " + $f.type + " | " + $f.placeholder + " | " + $f.value + " |"
          }
          $lines += ""
        }
        if ($form.selects.Count -gt 0) {
          $lines += "#### Selects"
          foreach ($s in $form.selects) {
            $lines += "- " + $s.name + ": " + $s.options.Count.ToString() + " options"
            if ($s.options.Count -le 10) {
              foreach ($o in $s.options) {
                $lines += "  - " + $o.value + " = " + $o.label
              }
            }
          }
          $lines += ""
        }
        if ($form.radios.Count -gt 0) {
          $lines += "#### Radios"
          foreach ($r in $form.radios) { $lines += "- " + $r.name + " = " + $r.value }
          $lines += ""
        }
        if ($form.checkboxes.Count -gt 0) {
          $lines += "#### Checkboxes"
          foreach ($c in $form.checkboxes) { $lines += "- " + $c.name + " = " + $c.value }
          $lines += ""
        }
      }
    }
    
    # AJAX
    if ($json.ajaxEndpoints.Count -gt 0) {
      $lines += "## AJAX Endpoints"
      $lines += ""
      foreach ($ep in $json.ajaxEndpoints) { $lines += "- " + $ep }
      $lines += ""
    }
    
    # DT columns
    if ($json.dtColumns.Count -gt 0) {
      $lines += "## Data Table Columns"
      $lines += ""
      $i = 1
      foreach ($c in $json.dtColumns) { $lines += ($i.ToString() + ". " + $c); $i++ }
      $lines += ""
    }
    
    # JS functions
    if ($json.jsFunctions.Count -gt 0) {
      $lines += "## JS Functions"
      $lines += ""
      foreach ($fn in $json.jsFunctions) { $lines += "- " + $fn + "()" }
      $lines += ""
    }
    
    # JS events
    if ($json.jsEvents.Count -gt 0) {
      $lines += "## Inline Events"
      $lines += ""
      foreach ($ev in $json.jsEvents) { $lines += "- " + $ev }
      $lines += ""
    }
    
    # Sessions
    if ($json.sessionOpts.Count -gt 0) {
      $lines += "## Sessions"
      $lines += ""
      foreach ($s in $json.sessionOpts) { $lines += ("- " + $s.value + " = " + $s.label) }
      $lines += ""
    }
    
    # Sidebar nav
    if ($json.sidebarNav.Count -gt 0) {
      $lines += "## Sidebar"
      $lines += ""
      foreach ($n in $json.sidebarNav) { $lines += ("- " + $n.label + " -> " + $n.href) }
      $lines += ""
    }
    
    # Assets
    if ($json.cssAssets.Count -gt 0 -or $json.jsAssets.Count -gt 0) {
      $lines += "## Assets"
      $lines += ""
      if ($json.cssAssets.Count -gt 0) {
        $lines += "### CSS (" + $json.cssAssets.Count.ToString() + ")"
        foreach ($a in $json.cssAssets) { $lines += "- " + $a }
        $lines += ""
      }
      if ($json.jsAssets.Count -gt 0) {
        $lines += "### JS (" + $json.jsAssets.Count.ToString() + ")"
        foreach ($a in $json.jsAssets) { $lines += "- " + $a }
        $lines += ""
      }
    }
    
    # Modals
    if ($json.modals.Count -gt 0) {
      $lines += "## Modals"
      $lines += ""
      foreach ($m in $json.modals) { $lines += "- " + $m }
      $lines += ""
    }
    
    # Uploads
    if ($json.uploads.Count -gt 0) {
      $lines += "## Uploads"
      $lines += ""
      foreach ($u in $json.uploads) { $lines += "- " + $u }
      $lines += ""
    }
    
    # Links
    if ($json.links.Count -gt 0) {
      $lines += "## Links (" + $json.links.Count.ToString() + ")"
      $lines += ""
      $cnt = 0
      foreach ($l in $json.links) {
        if ($cnt -ge 20) { $lines += "- ... and " + ($json.links.Count - 20).ToString() + " more"; break }
        $lines += "- " + $l
        $cnt++
      }
      $lines += ""
    }
    
    # Layout
    if ($json.layoutClasses.Count -gt 0) {
      $lines += "## Layout"
      $lines += ""
      $lines += "Grid: " + ($json.layoutClasses -join ', ')
      $lines += ""
    }
    
    $content = $lines -join "`n"
    Set-Content -Path $mdPath -Value $content -Encoding UTF8
    "OK    $moduleName/$route.md"
    $generated++
  } catch {
    "ERR   $($jf.Name): $($_.Exception.Message.Substring(0,[Math]::Min(60,$_.Exception.Message.Length)))"
  }
}
"=== Generated $generated .md files ==="
