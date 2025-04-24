@echo off

::################################################################################################

:: Set the image name and container name
set frontendImageName=angular-app
set backendImageName=flask-app
set frontendContainerName=RoleInitiative-frontend-container
set backendContainerName=RoleInitiative-backend-container

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

:: Prompt the user for which Dockerfile to use
echo -------------------------------------------------------------
echo Select which Dockerfile to use for building the Docker image:
echo (1). Github Main Branch
echo (2). Github Dev Branch
echo (3). Local Files
echo (4). *Custom Github branch
echo (5). Github Dev Branch (Backend Only)
choice /c 12345 /n /m "Enter the number (1, 2, 3, 4, or 5): "
echo.

:: Determine which Dockerfile to use based on user input
if errorlevel 5 (
	echo Creating Backend Dockerfile (DevGit^)...
	(
		echo # Dockerfile - Developer Github configuration
		echo FROM python:3.12.7
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo WORKDIR %appFolder%
		echo.
		echo #RUN git clone -b main https://github.com/Sahmuraii/RoleInitiative.git
		echo RUN git clone -b dev-branch https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo RUN pip install -r requirements.txt
		echo.
		echo EXPOSE 5000
		echo.
		echo #Run Github Branch
		echo WORKDIR %appFolder%%projectFolder%%appPath%
		echo.
		echo #Run local development
		echo #WORKDIR %appFolder%%appPath%
		echo.
		echo ENTRYPOINT FLASK_APP=%appName% FLASK_DEBUG=1 flask run --port=5000 --host=0.0.0.0
    ) > %dockerfileBackendPath%
	echo Creating Frontend Dockerfile (DevGit^)...
	(
		echo # Dockerfile - Developer Github configuration - frontend
		echo FROM node:22-alpine
		echo.
		echo CMD sleep 1
	) > %dockerfileFrontendPath%
    echo Using Dockerfile - Developer Github configuration...
) else if errorlevel 4 (
	set /p choice="Enter the name of the branch: "
	echo Creating Backend Dockerfile (Custom - %choice%^)...
	(
		echo # Dockerfile - Custom-branch configuration
		echo FROM python:3.12.7
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo WORKDIR %appFolder%
		echo RUN git clone -b %choice% https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo RUN pip install -r requirements.txt
		echo.
		echo EXPOSE 5000
		echo.
		echo #Run Github Branch
		echo #WORKDIR %appFolder%%projectFolder%%appPath%
		echo.
		echo #Run local development
		echo WORKDIR %appFolder%%projectFolder%%appPath%
		echo.
		echo ENTRYPOINT FLASK_APP=%appName% FLASK_DEBUG=1 flask run --port=5000 --host=0.0.0.0
	) > %dockerfileBackendPath%
	echo Creating Frontend Dockerfile (Custom - %choice%^)...
	(
		echo # Dockerfile - Custom-branch configuration - frontend
		echo FROM node:22-alpine
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo # Install git
		echo RUN apk update ^&^& apk add --no-cache git
		echo.
		echo WORKDIR %appFolder%
		echo RUN git clone -b %choice% https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo WORKDIR %appFolder%%projectFolder%%angularPath%
		echo RUN npm config set strict-ssl false
		echo RUN npm install -g @angular/cli
		echo RUN npm install
		echo RUN npm install -g http-server
		echo RUN npm install ngx-quill@25.3.3
		echo RUN npm install quill
		echo.
		echo RUN ng add @angular/material
		echo.
		echo EXPOSE 4200
		echo.
		echo # Set the working directory to the output folder of the Angular build
		echo #WORKDIR %appFolder%%projectFolder%%angularPath%/dist/%angularAppName%
		echo.
		echo #ENTRYPOINT http-server . --port 4200
		echo ENTRYPOINT ng serve --host 0.0.0.0
	) > %dockerfileFrontendPath%
	echo Using Dockerfile - Custom-branch configuration...
) else if errorlevel 3 (
	echo Creating Backend Dockerfile (LocalFile^)...
	(
		echo # Dockerfile - Local File configuration
		echo FROM python:3.12.7
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo WORKDIR %appFolder%
		echo #RUN git clone -b main https://github.com/Sahmuraii/RoleInitiative.git
		echo #RUN git clone -b dev-branch https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo RUN pip install -r requirements.txt
		echo.
		echo EXPOSE 5000
		echo.
		echo #Run Github Branch
		echo #WORKDIR %appFolder%%projectFolder%%appPath%
		echo.
		echo #Run local development
		echo WORKDIR %appFolder%%projectFolder%%appPath%
		echo.
		echo ENTRYPOINT FLASK_APP=%appName% FLASK_DEBUG=1 flask run --port=5000 --host=0.0.0.0
	) > %dockerfileBackendPath%
	echo Creating Frontend Dockerfile (LocalFile^)...
	(
		echo # Dockerfile - Local File configuration - frontend
		echo FROM node:22-alpine
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo # Install git
		echo RUN apk update ^&^& apk add --no-cache git
		echo.
		echo WORKDIR %appFolder%
		echo #RUN git clone -b main https://github.com/Sahmuraii/RoleInitiative.git
		echo #RUN git clone -b dev-branch https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo WORKDIR %appFolder%%projectFolder%%angularPath%
		echo RUN npm config set strict-ssl false
		echo RUN npm install -g @angular/cli
		echo RUN npm install
		echo RUN npm install -g http-server
		echo RUN npm install ngx-quill@25.3.3
		echo RUN npm install quill
		echo.
		echo RUN ng add @angular/material
		echo.
		echo EXPOSE 4200
		echo.
		echo # Set the working directory to the output folder of the Angular build
		echo #WORKDIR %appFolder%%projectFolder%%angularPath%/dist/%angularAppName%
		echo.
		echo #ENTRYPOINT http-server . --port 4200
		echo ENTRYPOINT ng serve --host 0.0.0.0
	) > %dockerfileFrontendPath%
	echo Using Dockerfile - Local File configuration...
) else if errorlevel 2 (
	echo Creating Backend Dockerfile (DevGit^)...
	(
		echo # Dockerfile - Developer Github configuration
		echo FROM python:3.12.7
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo WORKDIR %appFolder%
		echo.
		echo #RUN git clone -b main https://github.com/Sahmuraii/RoleInitiative.git
		echo RUN git clone -b dev-branch https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo RUN pip install -r requirements.txt
		echo.
		echo EXPOSE 5000
		echo.
		echo #Run Github Branch
		echo WORKDIR %appFolder%%projectFolder%%appPath%
		echo.
		echo #Run local development
		echo #WORKDIR %appFolder%%appPath%
		echo.
		echo ENTRYPOINT FLASK_APP=%appName% FLASK_DEBUG=1 flask run --port=5000 --host=0.0.0.0
    ) > %dockerfileBackendPath%
	echo Creating Frontend Dockerfile (DevGit^)...
	(
		echo # Dockerfile - Developer Github configuration - frontend
		echo FROM node:22-alpine
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo # Install git
		echo RUN apk update ^&^& apk add --no-cache git
		echo.
		echo WORKDIR %appFolder%
		echo #RUN git clone -b main https://github.com/Sahmuraii/RoleInitiative.git
		echo RUN git clone -b dev-branch https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo WORKDIR %appFolder%%projectFolder%%angularPath%
		echo RUN npm config set strict-ssl false
		echo RUN npm install -g @angular/cli
		echo RUN npm install
		echo RUN npm install -g http-server
		echo RUN npm install ngx-quill@25.3.3
		echo RUN npm install quill
		echo.
		echo RUN ng add @angular/material
		echo.
		echo EXPOSE 4200
		echo.
		echo # Set the working directory to the output folder of the Angular build
		echo #WORKDIR %appFolder%%projectFolder%%angularPath%/dist/%angularAppName%
		echo.
		echo #ENTRYPOINT http-server . --port 4200
		echo ENTRYPOINT ng serve --host 0.0.0.0
	) > %dockerfileFrontendPath%
    echo Using Dockerfile - Developer Github configuration...
) else if errorlevel 1 (
	echo Creating Backend Dockerfile (MainGit^)...
	(
		echo # Dockerfile - Main Github configuration
		echo FROM python:3.12.7
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo WORKDIR %appFolder%
		echo.
		echo RUN git clone -b main https://github.com/Sahmuraii/RoleInitiative.git
		echo #RUN git clone -b dev-branch https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . .
		echo.
		echo RUN pip install -r requirements.txt
		echo.
		echo EXPOSE 5000
		echo.
		echo #Run Github Branch
		echo WORKDIR %appFolder%%projectFolder%%appPath%
		echo.
		echo #Run local development
		echo #WORKDIR %appFolder%%appPath%
		echo.
		echo ENTRYPOINT FLASK_APP=%appName% FLASK_DEBUG=1 flask run --port=5000 --host=0.0.0.0
    ) > %dockerfileBackendPath%
	echo Creating Frontend Dockerfile (MainGit^)...
	(
		echo # Dockerfile - Main Github configuration - frontend
		echo FROM node:22-alpine
		echo.
		echo ARG CACHEBUST=1
		echo.
		echo # Install git
		echo RUN apk update ^&^& apk add --no-cache git
		echo.
		echo WORKDIR %appFolder%
		echo RUN git clone -b main https://github.com/Sahmuraii/RoleInitiative.git
		echo #RUN git clone -b dev-branch https://github.com/Sahmuraii/RoleInitiative.git
		echo.
		echo WORKDIR %appFolder%%projectFolder%
		echo COPY . . 
		echo.
		echo WORKDIR %appFolder%%projectFolder%%angularPath%
		echo RUN npm config set strict-ssl false
		echo RUN npm install -g @angular/cli
		echo RUN npm install
		echo RUN npm install -g http-server
		echo RUN npm install ngx-quill@25.3.3
		echo RUN npm install quill
		echo.
		echo RUN ng add @angular/material
		echo.
		echo EXPOSE 4200
		echo.
		echo # Set the working directory to the output folder of the Angular build
		echo #WORKDIR %appFolder%%projectFolder%%angularPath%/dist/%angularAppName%
		echo.
		echo #ENTRYPOINT http-server . --port 4200
		echo ENTRYPOINT ng serve --host 0.0.0.0
	) > %dockerfileFrontendPath%
    echo Using Dockerfile - Main Github configuration...
) else (
	echo Invalid choice. Please enter 1, 2, 3, 4, or 5.
	echo Closing in 5 seconds...
	timeout /t 5 /nobreak >nul
	exit /b 1
)
timeout /t 1 /nobreak >nul

:: Check for any running container with the same name
echo.
echo -------------------------------------------------------------
echo Checking for any running container with the name %frontendContainerName%...
for /f "tokens=*" %%i in ('docker ps -a -q -f "name=%frontendContainerName%"') do set containerExists=%%i

if defined containerExists (
	echo Stopping the existing container %frontendContainerName%...
	docker stop %frontendContainerName% >nul
	docker rm %frontendContainerName% >nul
) else (
	echo   All Clear. No existing container with the name %frontendContainerName% found.
)

echo Checking for any running container with the name %backendContainerName%...
for /f "tokens=*" %%i in ('docker ps -a -q -f "name=%backendContainerName%"') do set containerExists=%%i

if defined containerExists (
	echo Stopping the existing container %backendContainerName%...
	docker stop %backendContainerName% >nul
	docker rm %backendContainerName% >nul
) else (
	echo   All Clear. No existing container with the name %backendContainerName% found.
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
	echo             - "backend-flask:backend"
	echo     backend-flask:
	echo         build:
	echo             context: .
	echo             dockerfile: %dockerfileBackendPath%
	echo             args:
	echo                 - "no-cache=true"
	echo             network: host
	echo         image: %backendImageName%
	echo         container_name: %backendContainerName%
	echo         restart: always
	echo         ports:
	echo             - "5000:5000"
	echo         networks:
	echo             - localnet
	echo networks:
	echo     localnet:
	echo         driver: bridge

) > %dockerComposePath%

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
echo Docker image built and running successfully with container name and port mapping.


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
) else if errorlevel 2 (
	::Do nothing...
	echo Leaving Container Open. Closing CMD...
) else if errorlevel 1 (
	echo Stopping the container %backendContainerName%...
	docker stop %backendContainerName% >nul
	echo Stopping the container %frontendContainerName%...
	docker stop %frontendContainerName% >nul
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
