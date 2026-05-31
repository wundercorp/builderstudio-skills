$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$CheckerPath = Join-Path $ScriptDirectory "check-wiring.mjs"
node $CheckerPath @args
exit $LASTEXITCODE
