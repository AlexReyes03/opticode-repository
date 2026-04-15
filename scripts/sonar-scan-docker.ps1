# Escaneo SonarQube con sonarsource/sonar-scanner-cli (Docker).
# Uso (desde cualquier sitio):  pwsh -File scripts/sonar-scan-docker.ps1
# Requiere: $env:SONAR_TOKEN y SonarQube en host (p. ej. host.docker.internal:9000).

$ErrorActionPreference = "Stop"
# Convert-Path evita prefijos tipo "Microsoft.PowerShell.Core\FileSystem::" que rompen el bind-mount en Docker.
$RepoRoot = Convert-Path (Join-Path $PSScriptRoot "..")
$Mount = $RepoRoot.Replace("\", "/")

if (-not (Test-Path (Join-Path $RepoRoot "sonar-project.properties"))) {
    Write-Error "No existe sonar-project.properties en la raiz del repo: $RepoRoot"
}

if (-not $env:SONAR_TOKEN) {
    Write-Error "Define el token: `$env:SONAR_TOKEN = '...'"
}

$hostUrl = if ($env:SONAR_HOST_URL) { $env:SONAR_HOST_URL } else { "http://host.docker.internal:9000" }

# --user 0:0 evita en muchos equipos Win+Docker que el UID 1000 del contenedor no pueda leer el bind-mount.
Write-Host "Montando: ${Mount} -> /usr/src"
docker run --rm `
    --user 0:0 `
    -e "SONAR_HOST_URL=$hostUrl" `
    -e "SONAR_TOKEN=$env:SONAR_TOKEN" `
    -v "${Mount}:/usr/src" `
    -w /usr/src `
    sonarsource/sonar-scanner-cli `
    "-Dsonar.projectKey=sonar-prueba" `
    "-Dsonar.sources=opticode_backend,opticode_frontend/src" `
    "-Dsonar.sourceEncoding=UTF-8" `
    "-Dsonar.projectName=Opticode (Backend + Frontend)" `
    "-Dsonar.projectVersion=1.0" `
    "-Dsonar.inclusions=**/*.py,**/*.js,**/*.jsx,**/*.css" `
    "-Dsonar.exclusions=**/migrations/**,**/__pycache__/**,**/.pytest_cache/**,**/.mypy_cache/**,**/htmlcov/**,**/venv/**,**/.venv/**,**/env/**,**/.env,**/.env.*,**/*.pyc,**/node_modules/**,**/static/**,**/staticfiles/**,**/media/**,**/logs/**,**/*.egg-info/**,**/dist/**,**/build/**,**/coverage/**,**/.vite/**,**/storybook-static/**,**/*.min.js,**/*.min.css,**/package-lock.json" `
    "-Dsonar.tests=opticode_backend" `
    "-Dsonar.test.inclusions=**/tests/**/*.py,**/test_*.py" `
    "-Dsonar.coverage.exclusions=**/*"
