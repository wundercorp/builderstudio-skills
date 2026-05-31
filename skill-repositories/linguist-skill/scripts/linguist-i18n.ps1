param(
  [string]$Root = ".",
  [switch]$Write,
  [switch]$Force
)

$Arguments = @("scripts/linguist-i18n.mjs", "--root", $Root)
if ($Write) { $Arguments += "--write" }
if ($Force) { $Arguments += "--force" }
node @Arguments
