param(
  [switch]$Write,
  [switch]$Force,
  [string]$Root = "."
)

$ArgumentList = @("scripts/accessibility-audit.mjs", "--root", $Root)
if ($Write) {
  $ArgumentList += "--write"
}
if ($Force) {
  $ArgumentList += "--force"
}

node @ArgumentList
