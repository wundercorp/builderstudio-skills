param(
  [string]$Title = "Coherence Strategy",
  [string]$Scope = "Not recorded",
  [string]$Root = ".",
  [string]$PromptFile = "",
  [switch]$Write,
  [switch]$Overwrite,
  [switch]$All,
  [switch]$PromptNormalization,
  [switch]$TechnologyDirection,
  [switch]$ImplementationMap,
  [switch]$AntiPatternReview,
  [switch]$SkillAlignment,
  [switch]$Tradeoffs,
  [switch]$Dated
)

$scriptPath = Join-Path $PSScriptRoot "coherence-plan.mjs"
$arguments = @($scriptPath, "--title", $Title, "--scope", $Scope, "--root", $Root)

if ($PromptFile -ne "") {
  $arguments += @("--prompt-file", $PromptFile)
}

if ($Write) {
  $arguments += "--write"
}

if ($Overwrite) {
  $arguments += "--overwrite"
}

if ($All) {
  $arguments += "--all"
}

if ($PromptNormalization) {
  $arguments += "--prompt-normalization"
}

if ($TechnologyDirection) {
  $arguments += "--technology-direction"
}

if ($ImplementationMap) {
  $arguments += "--implementation-map"
}

if ($AntiPatternReview) {
  $arguments += "--anti-pattern-review"
}

if ($SkillAlignment) {
  $arguments += "--skill-alignment"
}

if ($Tradeoffs) {
  $arguments += "--tradeoffs"
}

if ($Dated) {
  $arguments += "--dated"
}

node @arguments
exit $LASTEXITCODE
