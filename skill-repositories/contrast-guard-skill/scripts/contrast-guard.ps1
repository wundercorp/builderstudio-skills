param(
  [switch]$Write,
  [switch]$Force,
  [string]$Root = "."
)

$ArgumentList = @("scripts/contrast-guard.mjs", "--root", $Root)
if ($Write) {
  $ArgumentList += "--write"
}
if ($Force) {
  $ArgumentList += "--force"
}

node @ArgumentList
