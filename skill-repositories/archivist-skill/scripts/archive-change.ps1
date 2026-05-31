param(
  [string]$Title = "",
  [string]$Type = "maintenance",
  [string]$Summary = "Not recorded",
  [string]$Root = ".",
  [switch]$Write,
  [switch]$UpdateChangelog,
  [switch]$ReleaseNote,
  [switch]$Adr,
  [switch]$Migration,
  [switch]$ApiChange,
  [switch]$Deployment,
  [switch]$InstallGithubTemplates
)

$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$NodeScriptPath = Join-Path $ScriptDirectory "archive-change.mjs"
$Arguments = @($NodeScriptPath, "--root", $Root, "--title", $Title, "--type", $Type, "--summary", $Summary)

if ($Write) {
  $Arguments += "--write"
}

if ($UpdateChangelog) {
  $Arguments += "--update-changelog"
}

if ($ReleaseNote) {
  $Arguments += "--release-note"
}

if ($Adr) {
  $Arguments += "--adr"
}

if ($Migration) {
  $Arguments += "--migration"
}

if ($ApiChange) {
  $Arguments += "--api-change"
}

if ($Deployment) {
  $Arguments += "--deployment"
}

if ($InstallGithubTemplates) {
  $Arguments += "--install-github-templates"
}

node @Arguments
exit $LASTEXITCODE
