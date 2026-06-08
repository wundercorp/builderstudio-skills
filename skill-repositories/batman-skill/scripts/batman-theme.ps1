param(
  [string]$Root = ".",
  [switch]$Write,
  [switch]$Force
)

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScriptPath = Join-Path $scriptDirectory "batman-theme.mjs"
$arguments = @($nodeScriptPath, "--root", $Root)

if ($Write) {
  $arguments += "--write"
}

if ($Force) {
  $arguments += "--force"
}

node @arguments
exit $LASTEXITCODE
