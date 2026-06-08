$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$CheckerPath = Join-Path $ScriptDirectory "check-svalbard.mjs"
node $CheckerPath @args
exit $LASTEXITCODE
