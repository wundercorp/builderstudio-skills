param(
  [string]$Root = ".",
  [string]$Brand = "Brand",
  [string]$Duration = "45",
  [switch]$Write,
  [switch]$Force
)

$argumentsList = @("scripts/ogilvideo-brief.mjs", "--root", $Root, "--brand", $Brand, "--duration", $Duration)
if ($Write) {
  $argumentsList += "--write"
}
if ($Force) {
  $argumentsList += "--force"
}
node @argumentsList
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
