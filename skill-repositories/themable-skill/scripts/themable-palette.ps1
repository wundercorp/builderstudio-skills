param(
  [string]$Root = ".",
  [switch]$Write,
  [switch]$Force
)

$Arguments = @("scripts/themable-palette.mjs", "--root", $Root)
if ($Write) { $Arguments += "--write" }
if ($Force) { $Arguments += "--force" }
node @Arguments
