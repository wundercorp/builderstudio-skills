$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$CheckerPath = Join-Path $ScriptDirectory "check-patcher.mjs"
node $CheckerPath @args
exit $LASTEXITCODE
