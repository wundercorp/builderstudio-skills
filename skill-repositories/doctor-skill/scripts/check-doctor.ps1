param(
  [string]$Root = ".",
  [switch]$Fix,
  [switch]$Json,
  [string]$FromError = ""
)

$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$CheckerPath = Join-Path $ScriptDirectory "check-doctor.mjs"
$Arguments = @($CheckerPath, "--root", $Root)

if ($Fix) {
  $Arguments += "--fix"
}

if ($Json) {
  $Arguments += "--json"
}

if ($FromError -ne "") {
  $Arguments += "--from-error"
  $Arguments += $FromError
}

node @Arguments
