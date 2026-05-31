param(
    [switch]$Write,
    [switch]$IncludeBuild,
    [switch]$IncludeDeps,
    [switch]$IncludeArchives,
    [switch]$IncludeIde,
    [switch]$FailOnMatch,
    [switch]$FailOnSecret,
    [string]$Root = ""
)

$scriptDirectoryPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$cleanerScriptPath = Join-Path $scriptDirectoryPath "clean-repo.mjs"
$nodeArguments = @($cleanerScriptPath)

if ($Write) { $nodeArguments += "--write" }
if ($IncludeBuild) { $nodeArguments += "--include-build" }
if ($IncludeDeps) { $nodeArguments += "--include-deps" }
if ($IncludeArchives) { $nodeArguments += "--include-archives" }
if ($IncludeIde) { $nodeArguments += "--include-ide" }
if ($FailOnMatch) { $nodeArguments += "--fail-on-match" }
if ($FailOnSecret) { $nodeArguments += "--fail-on-secret" }
if ($Root -ne "") { $nodeArguments += @("--root", $Root) }

node @nodeArguments
exit $LASTEXITCODE
