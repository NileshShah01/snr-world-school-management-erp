param(
  [hashtable]$json
)
$md = @()
$md += "# " + $json.pageHeading
$md += ""
$md += "**Route:** " + '/employee/' + $json.route
$md += ""
$md += "**Title:** " + $json.title
$md += ""
$md += "**HTML Size:** " + [Math]::Round($json.htmlSize / 1024, 1).ToString() + " KB"
$md += ""

if ($json.forms.Count -gt 0) {
  $md += "## Forms"
  $md += ""
  $fi = 0
  foreach ($form in $json.forms) {
    $fi++
    $md += "### Form " + $fi.ToString()
    $md += "- Action: " + $form.action
    $md += "- Method: " + $form.method
    if ($form.enctype) { $md += "- Enctype: " + $form.enctype }
    $md += ""
    
    if ($form.fields.Count -gt 0) {
      $md += "#### Input Fields"
      $md += "| Name | Type | Placeholder | Default |"
      $md += "|------|------|-------------|---------|"
      foreach ($f in $form.fields) {
        $md += "| " + $f.name + " | " + $f.type + " | " + $f.placeholder + " | " + $f.value + " |"
      }
      $md += ""
    }
    
    if ($form.selects.Count -gt 0) {
      $md += "#### Select Dropdowns"
      foreach ($s in $form.selects) {
        $md += "- " + $s.name + ": " + $s.options.Count.ToString() + " options"
        if ($s.options.Count -le 10) {
          foreach ($o in $s.options) {
            $md += "  - " + $o.value + " = " + $o.label
          }
        }
      }
      $md += ""
    }
    
    if ($form.radios.Count -gt 0) {
      $md += "#### Radio Buttons"
      foreach ($r in $form.radios) {
        $md += "- " + $r.name + " = " + $r.value
      }
      $md += ""
    }
    
    if ($form.checkboxes.Count -gt 0) {
      $md += "#### Checkboxes"
      foreach ($c in $form.checkboxes) {
        $md += "- " + $c.name + " = " + $c.value
      }
      $md += ""
    }
  }
}

if ($json.ajaxEndpoints.Count -gt 0) {
  $md += "## AJAX Endpoints"
  $md += ""
  foreach ($ep in $json.ajaxEndpoints) {
    $md += "- " + $ep
  }
  $md += ""
}

if ($json.dtColumns.Count -gt 0) {
  $md += "## Data Table Columns"
  $md += ""
  $md += "| # | Column |"
  $md += "|---|--------|"
  $i = 1
  foreach ($c in $json.dtColumns) {
    $md += "| " + $i.ToString() + " | " + $c + " |"
    $i++
  }
  $md += ""
}

if ($json.jsFunctions.Count -gt 0) {
  $md += "## JavaScript Functions"
  $md += ""
  foreach ($fn in $json.jsFunctions) {
    $md += "- " + $fn + "()"
  }
  $md += ""
}

if ($json.jsEvents.Count -gt 0) {
  $md += "## Inline Events"
  $md += ""
  foreach ($ev in $json.jsEvents) {
    $md += "- " + $ev
  }
  $md += ""
}

if ($json.sessionOpts.Count -gt 0) {
  $md += "## Sessions (Financial Years)"
  $md += ""
  foreach ($s in $json.sessionOpts) {
    $md += "- " + $s.value + " = " + $s.label
  }
  $md += ""
}

if ($json.sidebarNav.Count -gt 0) {
  $md += "## Sidebar Navigation"
  $md += ""
  foreach ($n in $json.sidebarNav) {
    $md += "- " + $n.label + " -> " + $n.href + " [icon: " + $n.icon + "]"
  }
  $md += ""
}

if ($json.cssAssets.Count -gt 0 -or $json.jsAssets.Count -gt 0) {
  $md += "## Assets"
  $md += ""
  if ($json.cssAssets.Count -gt 0) {
    $md += "### CSS (" + $json.cssAssets.Count.ToString() + " files)"
    foreach ($a in $json.cssAssets) { $md += "- " + $a }
    $md += ""
  }
  if ($json.jsAssets.Count -gt 0) {
    $md += "### JavaScript (" + $json.jsAssets.Count.ToString() + " files)"
    foreach ($a in $json.jsAssets) { $md += "- " + $a }
    $md += ""
  }
}

if ($json.modals.Count -gt 0) {
  $md += "## Modals"
  $md += ""
  foreach ($m in $json.modals) { $md += "- #" + $m }
  $md += ""
}

if ($json.uploads.Count -gt 0) {
  $md += "## File Uploads"
  $md += ""
  foreach ($u in $json.uploads) { $md += "- " + $u }
  $md += ""
}

if ($json.links.Count -gt 0) {
  $md += "## Links (unique: " + $json.links.Count.ToString() + ")"
  $md += ""
  $shown = 0
  foreach ($l in $json.links) {
    if ($shown -ge 30) { $md += "- ... and " + ($json.links.Count - 30).ToString() + " more"; break }
    $md += "- " + $l
    $shown++
  }
  $md += ""
}

if ($json.layoutClasses.Count -gt 0) {
  $md += "## Layout"
  $md += ""
  $md += "Grid classes: " + ($json.layoutClasses -join ', ')
  $md += ""
}

return ($md -join "`n")
