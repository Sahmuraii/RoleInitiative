@echo off
setlocal EnableDelayedExpansion

::################################################################################################

:: Set port info
set frontendPort=4200
set backendPort=5000

:: Set the image name and container name
set groupContainerName=roleinitiative-parent
set frontendImageName=angular-app
set backendImageName=flask-app
set frontendContainerName=RoleInitiative-frontend-container
set backendContainerName=RoleInitiative-backend-container
set nginxContainerName=RoleInitiative-proxy-container

:: Set dockerfile name
set dockerfileFrontendPath=BatchDockerfile1.local
set dockerfileBackendPath=BatchDockerfile2.local
set dockerComposePath=Docker-Compose.yml

:: Set file structure information
set appFolder=/RoleInitiativeFolder
set projectFolder=/RoleInitiative
set appPath=
set appName=run
set angularPath=/frontend
set angularAppName=frontend

:: Set Nginx info
set nginxPath=nginx
set nginxCertFile=roleinitiative-cert.pem
set nginxKeyFile=roleinitiative-key.pem

:: Set Github info
set githubRepo=https://github.com/Sahmuraii/RoleInitiative.git
set githubMainBranch=main
set githubDevBranch=dev-branch


::################################################################################################



:: Check if Docker is running by using docker info
docker info >nul 2>&1
if errorlevel 1 (
	echo Docker Desktop is not running. Please start Docker Desktop and try again.
	timeout /t 5 /nobreak
	exit /b 1
)

:: Check for .env file. Database will not work without it.
if NOT EXIST .env (
	echo Environment File not found. Please contact an admin if you should be in posession of this file.
	timeout /t 10 /nobreak
	exit /b 1
)


:: Prompt if using ssl
echo -------------------------------------------------------------
echo Do you want to use an nginx proxy?
echo (1). Yes, use a proxy [HTTPS]
echo (2). No, dont use a proxy [HTTP]
choice /t 15 /c 12 /d 1 /n /m "Enter the number (1, or 2): "
set sslChoice=%errorlevel%
echo.


:: Set ssl-cert based on choice
set "sslCert= "
if %sslChoice%==1 (
	:: Check for Nginx folder
	if NOT EXIST %nginxPath% (
		echo Nginx folder not found. Please contact an admin if you should be in posession of this file.
		timeout /t 10 /nobreak
		exit /b 1
	)

	:: Check for certificate files. Needed for HTTPS.
	if NOT EXIST %nginxPath%\certs\%nginxCertFile% (
		echo Certificate File not found. Please contact an admin if you should be in posession of this file.
		timeout /t 10 /nobreak
		exit /b 1
	)
	if NOT EXIST %nginxPath%\certs\%nginxKeyFile% (
		echo Certificate Key File not found. Please contact an admin if you should be in posession of this file.
		timeout /t 10 /nobreak
		exit /b 1
	)
	
)


:: Prompt the user for which Dockerfile to use
echo -------------------------------------------------------------
echo Select which Dockerfile to use for building the Docker image:
echo (1). Github Main Branch
echo (2). Github Dev Branch
echo (3). Local Files
echo (4). *Custom Github branch
echo (5). Github Dev Branch (Backend Only^)
choice /t 20 /c 12345 /d 1 /n /m "Enter the number (1, 2, 3, 4, or 5): "

set userChoice=%errorlevel%
echo.


:: Determine which Dockerfile to use based on user input
:: Start by setting default values for the Dockerfile variables
set "userBackendMessage=Creating Backend Dockerfile (MainGit^)..."
set "backendDockerfileTitle=# Dockerfile - Main Github configuration - backend"
set "backendDockerfileFrom=FROM python:3.12.7"
set "backendDockerfileRunGit=RUN git clone -b %githubMainBranch% %githubRepo%"
set "backendDockerfileExpose=EXPOSE %backendPort%"
set "backendDockerfileWorkdirTitle=# Run Github Main Branch"
set "backendDockerfileWorkdir=WORKDIR %appFolder%%projectFolder%%appPath%"
set "backendDockerfileEntryPoint=ENTRYPOINT FLASK_APP=%appName% FLASK_DEBUG=1 flask run --port=%backendPort% --host=0.0.0.0 %sslCert%"

set "userFrontendMessage=Creating Frontend Dockerfile (MainGit^)..."
set "frontendDockerfileTitle=# Dockerfile - Main Github configuration - frontend"
set "frontendDockerfileFrom=FROM node:22-alpine"
set "frontendDockerfileRunGit=RUN git clone -b %githubMainBranch% %githubRepo%"
set "frontendDockerfileExpose=EXPOSE %frontendPort%"
set "frontendDockerfileWorkdirTitle=# Run Github Main Branch"
set "frontendDockerfileWorkdir=WORKDIR %appFolder%%projectFolder%%angularPath%"
set "frontendDockerfileBuilddirTitle=# Set the working directory to the output folder of the Angular build"
set "frontendDockerfileBuilddir=#WORKDIR %appFolder%%projectFolder%%angularPath%/dist/%angularAppName%"
set "frontendDockerfileEntryPoint=ENTRYPOINT ng serve --host 0.0.0.0"

:: Set specific values for docker files
if "%userChoice%"=="5" (
	:: Github dev branch - frontend only
	set "userBackendMessage=Creating Backend Dockerfile (DevGit^)..."
	set "backendDockerfileTitle=# Dockerfile - Dev Github configuration - backend"
	set "backendDockerfileRunGit=RUN git clone -b %githubDevBranch% %githubRepo%"
	set "backendDockerfileWorkdirTitle=# Run Github Dev Branch"

	set "userFrontendMessage=Creating Frontend Dockerfile (DevGit^)..."
	set "frontendDockerfileTitle=# Dockerfile - Psudo configuration - frontend"
	set "frontendDockerfileRunGit=#RUN git clone -b %githubDevBranch% %githubRepo%"
	set "frontendDockerfileWorkdirTitle=# Run No Branch - Close immediately"
	set "frontendDockerfileEntryPoint=CMD sleep 1"

) else if "%userChoice%"=="4" (
	:: Github custom branch
	set /p branchChoice="Enter the name of the branch: "
	echo !branchChoice!

	set "userBackendMessage=Creating Backend Dockerfile (Custom - !branchChoice!Git^)..."
	set "backendDockerfileTitle=# Dockerfile - Custom (!branchChoice!^) Github configuration - backend"
	set "backendDockerfileRunGit=RUN git clone -b !branchChoice! %githubRepo%"
	set "backendDockerfileWorkdirTitle=# Run Github Custom (!branchChoice!^) Branch"

	set "userFrontendMessage=Creating Frontend Dockerfile (Custom - !branchChoice!Git^)..."
	set "frontendDockerfileTitle=# Dockerfile - Custom (!branchChoice!^) Github configuration - frontend"
	set "frontendDockerfileRunGit=RUN git clone -b !branchChoice! %githubRepo%"
	set "frontendDockerfileWorkdirTitle=# Run Github Custom (!branchChoice!^) Branch"

) else if "%userChoice%"=="3" (
	:: Local files
	set "userBackendMessage=Creating Backend Dockerfile (LocalFile^)..."
	set "backendDockerfileTitle=# Dockerfile - Local file configuration - backend"
	set "backendDockerfileRunGit=# No Github - local files"
	set "backendDockerfileWorkdirTitle=# Run Local files"

	set "userFrontendMessage=Creating Frontend Dockerfile (LocalFile^)..."
	set "frontendDockerfileTitle=# Dockerfile - Local file configuration - frontend"
	set "frontendDockerfileRunGit=# No Github - local files"
	set "frontendDockerfileWorkdirTitle=# Run Local files"

) else if "%userChoice%"=="2" (
	:: Local files
	set "userBackendMessage=Creating Backend Dockerfile (DevGit^)..."
	set "backendDockerfileTitle=# Dockerfile - Dev Github configuration - backend"
	set "backendDockerfileRunGit=RUN git clone -b %githubDevBranch% %githubRepo%"
	set "backendDockerfileWorkdirTitle=# Run Github Dev Branch"

	set "userFrontendMessage=Creating Frontend Dockerfile (DevGit^)..."
	set "frontendDockerfileTitle=# Dockerfile - Dev Github configuration - frontend"
	set "frontendDockerfileRunGit=RUN git clone -b %githubDevBranch% %githubRepo%"
	set "frontendDockerfileWorkdirTitle=# Run Github Dev Branch"

) else if "%userChoice%"=="1" (
	:: No change from default
	set "userBackendMessage=Creating Backend Dockerfile (MainGit^)..."

) else (
	echo Invalid choice. Please enter 1, 2, 3, 4, or 5.
	echo Closing in 5 seconds...
	timeout /t 5 /nobreak >nul
	exit /b 1
)

timeout /t 1 /nobreak >nul


:: Create Docker files using variables set based on user input
echo %userBackendMessage%
	(
		echo !backendDockerfileTitle!
		echo !backendDockerfileFrom!
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo WORKDIR !appFolder!
		echo.
        echo !backendDockerfileRunGit!
		echo.
		echo WORKDIR !appFolder!!projectFolder!
		echo COPY . . 
		echo.
		echo RUN pip install -r requirements.txt
		echo.
		echo !backendDockerfileExpose!
		echo.
        echo !backendDockerfileWorkdirTitle!
        echo !backendDockerfileWorkdir!
		echo.
		echo !backendDockerfileEntryPoint!
    ) > %dockerfileBackendPath%

echo %userFrontendMessage%
	(
		echo !frontendDockerfileTitle!
		echo !frontendDockerfileFrom!
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo # Install git
		echo RUN apk update ^&^& apk add --no-cache git
		echo.
		echo WORKDIR !appFolder!
		echo !frontendDockerfileRunGit!
		echo.
		echo WORKDIR !appFolder!!projectFolder!
		echo COPY . . 
		echo.
        echo !frontendDockerfileWorkdirTitle!
		echo !frontendDockerfileWorkdir!
	) > %dockerfileFrontendPath%
if NOT %userChoice%==5 (
	(
		echo RUN npm config set strict-ssl false
        echo.
		echo RUN npm install -g @angular/cli
		echo RUN npm install
		echo RUN npm install -g http-server
		echo RUN npm install ngx-quill@25.3.3
		echo RUN npm install quill
		echo.
		echo RUN ng add @angular/material
		echo.
	) >> %dockerfileFrontendPath%
)
	(
		echo !frontendDockerfileExpose!
		echo.
		echo !frontendDockerfileBuilddirTitle!
		echo !frontendDockerfileBuilddir!
		echo.
		echo #ENTRYPOINT http-server . --port !frontendPort!
		echo !frontendDockerfileEntryPoint!
	) >> %dockerfileFrontendPath%


:: Check for any running container with the same name
echo.
echo -------------------------------------------------------------
echo Checking for any running container with the name %frontendContainerName%...
for /f "tokens=*" %%i in ('docker ps -a -q -f "name=%frontendContainerName%"') do set containerExists=%%i

:: Stop Frontend container
if defined containerExists (
	echo Stopping the existing container %frontendContainerName%...
	docker stop %frontendContainerName% >nul
	docker rm %frontendContainerName% >nul
) else (
	echo   All Clear. No existing container with the name %frontendContainerName% found.
)

:: Stop Backend container
echo Checking for any running container with the name %backendContainerName%...
for /f "tokens=*" %%i in ('docker ps -a -q -f "name=%backendContainerName%"') do set containerExists=%%i

if defined containerExists (
	echo Stopping the existing container %backendContainerName%...
	docker stop %backendContainerName% >nul
	docker rm %backendContainerName% >nul
) else (
	echo   All Clear. No existing container with the name %backendContainerName% found.
)

:: Stop nginx container
echo Checking for any running container with the name %nginxContainerName%...
for /f "tokens=*" %%i in ('docker ps -a -q -f "name=%nginxContainerName%"') do set containerExists=%%i

if defined containerExists (
	echo Stopping the existing container %nginxContainerName%...
	docker stop %nginxContainerName% >nul
	docker rm %nginxContainerName% >nul
) else (
	echo   All Clear. No existing container with the name %nginxContainerName% found.
)


:: Prune unused Docker images
echo.
echo -------------------------------------------------------------
echo Pruning unused Docker images...
docker image prune -f


:: Run new images using a docker-compose.yml file
echo.
echo -------------------------------------------------------------
echo Creating Docker-Compose
(
	echo name: %groupContainerName%
	echo services:
	echo     frontend-angular:
	echo         build:
	echo             context: .
	echo             dockerfile: %dockerfileFrontendPath%
	echo             args:
	echo                 - "no-cache=true"
	echo             network: host
	echo         image: %frontendImageName%
	echo         container_name: %frontendContainerName%
	echo         restart: on-failure
	echo         ports:
	echo             - "4200:4200"
	echo         networks:
	echo             - localnet
	echo         depends_on:
	echo             - backend-flask
	echo         links:
	echo             - "backend-flask:127.0.0.1"
	echo     backend-flask:
	echo         build:
	echo             context: .
	echo             dockerfile: %dockerfileBackendPath%
	echo             args:
	echo                 - "no-cache=true"
	echo             network: host
	echo         image: %backendImageName%
	echo         container_name: %backendContainerName%
	echo         restart: on-failure
	echo         ports:
	echo             - "5000:5000"
	echo         networks:
	echo             - localnet
) > %dockerComposePath%
if %sslChoice%==1 (
	(
	echo     nginx-backend-proxy:
	echo         image: nginx:latest
	echo         container_name: %nginxContainerName%
	echo         ports:
	echo             - "80:80"
	echo             - "443:443"
	echo         volumes:
	echo             - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
	echo             - ./nginx/certs:/etc/nginx/certs
	echo         depends_on:
	echo             - backend-flask
	echo         networks:
	echo             - localnet
	) >> %dockerComposePath%
)
(
	echo networks:
	echo     localnet:
	echo         driver: bridge

) >> %dockerComposePath%

:: Run the Docker-Compose file
docker-compose up --build -d

:: Check if the containers were started successfully
if errorlevel 1 (
	echo Docker-Compose failed to build and/or start the containers.
	exit /b 1
)

echo.
echo.
echo -------------------------------------------------------------
echo Docker images built and running successfully with container names and port mappings.


:: Prompt the user if they would like to stop the dockerfile
echo.
echo -------------------------------------------------------------
echo Would you like to stop the docker container?
echo (Will default to option 3 after 30 seconds^)
echo (1). Ready to stop
echo (2). Leave it running
echo (3). Wait 75 seconds and stop
choice /t 30 /c 123 /d 3 /n /m "Enter the number (1, 2, or 3): "

:: Determine whether or not to stop the container based on user input
echo.
echo -------------------------------------------------------------
if errorlevel 3 (
	echo Setting 75 second timer...
	timeout /t 75
	echo Stopping the container %backendContainerName%...
	docker stop %backendContainerName% >nul
	echo Stopping the container %frontendContainerName%...
	docker stop %frontendContainerName% >nul
	echo Stoping the container %nginxContainerName%...
	docker stop %nginxContainerName% >nul
) else if errorlevel 2 (
	::Do nothing...
	echo Leaving Container Open. Closing CMD...
) else if errorlevel 1 (
	echo Stopping the container %backendContainerName%...
	docker stop %backendContainerName% >nul
	echo Stopping the container %frontendContainerName%...
	docker stop %frontendContainerName% >nul
	echo Stoping the container %nginxContainerName%...
	docker stop %nginxContainerName% >nul
) else (
	echo Invalid choice. Please enter 1, 2, or 3
	echo Closing in 5 seconds...
	timeout /t 5 /nobreak >nul
	exit /b 1
)

:: Show a 10-second timer before closing
echo.
echo -------------------------------------------------------------
echo Closing in 10 seconds...
timeout /t 10 /nobreak
exit /b 0
