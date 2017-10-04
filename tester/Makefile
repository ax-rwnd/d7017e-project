BASEIMAGE="node:alpine"
APP_DIR="/usr/src/app"
PORT=8080

.DEFAULT_GOAL := all

all: python27 python3 java

base:
	# Set image environment
	echo "FROM $(BASEIMAGE)">$(DOCKERFILE)

	# Create app directory
	echo "RUN mkdir -p /usr/src/app">>"$(DOCKERFILE)"
	echo "WORKDIR /usr/src/app">>"$(DOCKERFILE)"

	# Install app dependencies
	echo "ADD /runner/package.json /usr/src/app/">>"$(DOCKERFILE)"
	echo "RUN npm install">>"$(DOCKERFILE)"

	# Bundle app source
	echo "ADD /runner /usr/src/app">>"$(DOCKERFILE)"

	echo "EXPOSE $(PORT)">>"$(DOCKERFILE)"

	echo "CMD [ \"npm\", \"start\", \"8080\" ]">>"$(DOCKERFILE)"

build:
	docker build -t tester_$(LANG) -f $(DOCKERFILE) .

# Languages below

python27:
	$(eval LANG="python27")
	$(eval DOCKERFILE="Dockerfile_Python27")

	make base DOCKERFILE=$(DOCKERFILE)

	# Python27 specific code
	echo "RUN apk add --update python">>"$(DOCKERFILE)"
	echo "RUN rm -rf /var/cache/apk/*">>"$(DOCKERFILE)"

	# Build image
	make build DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)

python3:
	$(eval LANG="python3")
	$(eval DOCKERFILE="Dockerfile_Python3")

	make base DOCKERFILE=$(DOCKERFILE)

	# Python3 specific code
	echo "RUN apk add --update python3">>"$(DOCKERFILE)"
	echo "RUN rm -rf /var/cache/apk/*">>"$(DOCKERFILE)"

	# Build image
	make build DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)

java:
	$(eval LANG="java")
	$(eval DOCKERFILE="Dockerfile_Java")

	make base DOCKERFILE=$(DOCKERFILE)

	# Java specific code
	echo "RUN apk --update add openjdk8-jre">>"$(DOCKERFILE)"
	echo "RUN rm -rf /var/cache/apk/*">>"$(DOCKERFILE)"

	# Build image
	make build DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)
