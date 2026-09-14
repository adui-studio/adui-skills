param(
    [string]$RepositoryRoot = ".",
    [switch]$Force,
    [switch]$SkipValidate
)

$ErrorActionPreference = "Stop"

$ArgsList = @(
    (Join-Path $PSScriptRoot "apply.mjs"),
    "--repository-root",
    $RepositoryRoot
)

if ($Force) {
    $ArgsList += "--force"
}

if ($SkipValidate) {
    $ArgsList += "--skip-validate"
}

& node @ArgsList
if ($LASTEXITCODE -ne 0) {
    throw "ADui Skills Pack v0.2.0 应用失败，退出码：$LASTEXITCODE"
}
