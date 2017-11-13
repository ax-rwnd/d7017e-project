# Learning As A Service
Learning as a service is a project that intends to help university students learn programming. The idea is to provide a platform for introducing gamified elements into their education, so that tools for external motivation can be added, used and evaluated against learning results.

# Installing
Learning as a service was built and tested on debian linux 9 (stretch) with node 8.6.0 and npm 5.3.0.

## Tester [![Tester Build Status](http://130.240.5.119:8080/job/GPP-Tester-CI/badge/icon)](http://130.240.5.119:8080/job/GPP-Tester-CI/)

Tester consists of two components; Manager and Runner. Managaer replies to requests from the backend and manages docker containers that run arbitrary code. Containers are used to ensure that some test A does not interfere with some later test B by modifying the executing environment.

Tester was built and tested with docker 17.09-ce.

1. Clone the repo: `git clone https://github.com/ax-rwnd/d7017e-project`
2. Change directory to the Manager folder: `cd d7017e-project/tester`
3. Install the dependencies for the Manager: `npm i`
4. (Optional) Select languages by adding/removing dependencies in `Makefile`. For instance the line `all: python27 python3 java c #haskell` selects the languages Python 2.7, Python 3, Java, C, but not Haskell (since it's commented out).
5. Run the Makefile: `make`
6. (Optional) Set preferences for Runner in `config/default.js`. There, things like queue lengths and ports may be configured.
7. Move back up to manager: `cd ..`
8. Start Manager: `node server.js {PORT}`

## Backend [![Build Status](http://130.240.5.119:8080/job/GPP-Backend-Dev-CI/badge/icon)](http://130.240.5.119:8080/job/GPP-Backend-Dev-CI/)

Backend is the state-managing component. It uses MongoDB to store information that it receives while processesing frontend requests and tester results.

Backend has been tested with version 3.2.11 of MongoDB.

0. Install och configure MongoDB.
1. Clone the repo: `git clone https://github.com/ax-rwnd/d7017e-project`
2. Change directory to backend: `cd d7017e-project/Backend`
3. Install dependencies: `npm i`
4. Configure database address/port in `Backend/config/default` and `Backend/config/production`. IP/Port may differ between the files, should you want to use different databases for testing and production. To select one of these files, set the `NODE_ENV` environment variable to  `production` or `development`.
5. Start the backend daemon: `npm start`.
  1. (Optional) Start start backend in the foreground: `node ./bin/www`

## Frontend [![Build Status](http://130.240.5.119:8080/job/GPP-Frontend-Dev-CI/badge/icon)](http://130.240.5.119:8080/job/GPP-Frontend-Dev-CI/)
Frontend presents data to the users, it builds on AngularJS for presenting and the backend for the logic.

In development, AngularJS version 4.2.4 was used.
