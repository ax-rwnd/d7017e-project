# Gamified Programming Platform (GPP)
The gamified programming platform is a project that intends to help university students learn programming. The idea is to provide a platform for introducing gamified elements into their education, so that tools for external motivation can be added, used and evaluated against learning results.

# Installing
The Gamified Programming Platform was built and tested on Debian GNU/Linux 9 (stretch) with nodejs 8.6.0 and npm 5.3.0. Furthermore, some components are essential only to some part of the system, these components are listed in their repsective sections. Note that to use the instructions below, these requirements must be fulfilled. Other setups may work, but your mileage may vary.

## Certificates
For each part, a self-signed default certificate has been provided so that it may be used to quickly evaluate the technologies. However, these certificates should be avoided when configuring the website for a live production environment.

Depending on which certificate authority is to be used, some different options may be provided to deploy new certificates (for example, Let'sEncrypt uses CertBot). The core idea is to place the private key in `encryption/private.key` and the certificate in `encryption/server.crt`, this way, the certificates will be served when users try to access the site.

## Tester [![Tester Build Status](http://130.240.5.119:8080/job/GPP-Tester-CI/badge/icon)](http://130.240.5.119:8080/job/GPP-Tester-CI/)

Tester consists of two components; Manager and Runner. Manager replies to requests from the backend and manages docker containers that run arbitrary code. Containers are used to ensure that some test A does not interfere with some later test B by modifying the execution environment. For this to work, docker 17.09-ce needs to be installed and available or else, no containers may start. To install tester, follow these instructions:

1. Clone the repo: `git clone https://github.com/ax-rwnd/d7017e-project`
2. Change directory to the Manager folder: `cd d7017e-project/tester`
3. Install the dependencies for the Manager: `npm i`
4. (Optional) Select languages by adding/removing dependencies in `Makefile`. For instance, the line `all: python27 python3 java c # haskell` selects the languages Python 2.7, Python 3, Java and C, but not Haskell (since it's commented out).
5. Run the Makefile: `make`
6. (Optional) Set preferences for Runner in `config/default.js`. There, things like queue lengths and ports may be configured.
7. Move or link the ssl-certificates `ln -s encryption/private.key.default encryption/private.key && ln -s encryption/server.crt.default encryption/server.crt`
8. Start Manager: `npm start {PORT}`

## Backend [![Build Status](http://130.240.5.119:8080/job/GPP-Backend-Dev-CI/badge/icon)](http://130.240.5.119:8080/job/GPP-Backend-Dev-CI/)

Backend is the state-managing component of the system. To run, it requires an instance of MongoDB (version 3.2.11 was tested) to which it can send queries. Once this dependency is met, it can be installed using the following instructions:

1. Clone the repo: `git clone https://github.com/ax-rwnd/d7017e-project`
2. Change directory to backend: `cd d7017e-project/backend`
3. Install dependencies: `npm i`
4. Configure database address/port in `backend/config/default` and `backend/config/production`. IP/Port may differ between the files, should one want to use different databases for testing and production. To select one of these files, set the `NODE_ENV` environment variable to `production` or `development`.
5. Start the backend daemon: `npm start`.
6. (Optional) Start backend in the foreground: `node ./bin/www`

## Frontend [![Build Status](http://130.240.5.119:8080/job/GPP-Frontend-Dev-CI/badge/icon)](http://130.240.5.119:8080/job/GPP-Frontend-Dev-CI/)

Frontend is the website that users visit with their browsers. It uses Angular 4 as a framework on top of node to render the website, meaning that an installation of Angular version 4.2.4 needs to be present on the host computer. Then, once the dependencies are met, frontend may the installed by using the following instructions:

1. Install Angular CLI: `npm install -g @angular/cli`
2. Clone the repo: `git clone https://github.com/ax-rwnd/d7017e-project`
3. Change directory to frontend: `cd d7017e-project/frontend`
4. Assign an address that will point to the backend server when doing API calls by editing `src/environments/envivornment.prod.ts` and changing the variable `backend_ip` with the IP address or domain name of your backend.
5. Assign an address that will point to the frontend server globally, i.e., a valid address that the end-user may use to reach the system from. To do this, edit `src/environments/envivornment.prod.ts` by changing the `frontend_ip` variable to said address. This is the value that will be used by CAS to handle post-login handover.
6. Move or link your ssl-certificates `ln -s encryption/private.key.default encryption/private.key && ln -s encryption/server.crt.default encryption/server.crt`
7. Start server: `npm start`

After setting the system up and starting it, the website should be available by browsing to the address that was set in step 5.
