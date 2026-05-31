$ScriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$GeneratorPath = Join-Path $ScriptDirectory "generate-architecture.mjs"
node $GeneratorPath @args
exit $LASTEXITCODE
