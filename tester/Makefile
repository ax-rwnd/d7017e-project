BASEIMAGE="node:alpine"
APP_DIR="/usr/src/app"
PORT=8080

CONFIGFILE="./config/languages.js"
space=$(empty) $(empty)
sub=','

.DEFAULT_GOAL := all

all: python27 python3 java c #haskell
	# Generate list of supported languages
	echo "exports.languages=['$(subst $(space),$(sub),$^)'];" > $(CONFIGFILE);

pre:
	# Set image environment
	echo "FROM $(BASEIMAGE)">$(DOCKERFILE)

	# Create app directory
	echo "RUN mkdir -p /usr/src/app">>"$(DOCKERFILE)"
	echo "WORKDIR /usr/src/app">>"$(DOCKERFILE)"

	# Install app dependencies
	echo "ADD /runner/package.json /usr/src/app/">>"$(DOCKERFILE)"
	echo "RUN npm install">>"$(DOCKERFILE)"

	# Bundle app source
	echo "ADD /runner /usr/src/app/">>"$(DOCKERFILE)"

	echo "EXPOSE $(PORT)">>"$(DOCKERFILE)"

	echo "CMD [ \"npm\", \"start\", \"8080\" ]">>"$(DOCKERFILE)"

post:
	# Remove all language specific files in image
	echo "RUN rm languages/*">>"$(DOCKERFILE)"

	# Add language specific files to test
	echo "ADD /runner/languages/$(LANG).js /usr/src/app/languages/">>"$(DOCKERFILE)"

	#Build image
	docker build -t tester_$(LANG) -f $(DOCKERFILE) .

# Languages below

python27:
	$(eval LANG="python27")
	$(eval DOCKERFILE="Dockerfile_Python27")

	make pre DOCKERFILE=$(DOCKERFILE)

	# Python27 specific code
	echo "RUN apk add --update python">>"$(DOCKERFILE)"
	echo "RUN apk add --update flake8">>"$(DOCKERFILE)"
	echo "RUN rm -rf /var/cache/apk/*">>"$(DOCKERFILE)"

	# Add language specific file and build image
	make post DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)

python3:
	$(eval LANG="python3")
	$(eval DOCKERFILE="Dockerfile_Python3")

	make pre DOCKERFILE=$(DOCKERFILE)

	# Python3 specific code
	echo "RUN apk add --update python3">>"$(DOCKERFILE)"
	wget https://bootstrap.pypa.io/get-pip.py
	echo "COPY get-pip.py /get-pip.py">>"$(DOCKERFILE)"
	echo "RUN python3 /get-pip.py">>"$(DOCKERFILE)"
	echo "RUN pip3 install flake8">>"$(DOCKERFILE)"
	echo "RUN rm -rf /var/cache/apk/*">>"$(DOCKERFILE)"

	# Add language specific file and build image
	make post DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)

	# cleanup
	rm get-pip.py

java:
	$(eval LANG="java")
	$(eval DOCKERFILE="Dockerfile_Java")

	make pre DOCKERFILE=$(DOCKERFILE)

	# Java specific code
	echo "RUN apk --no-cache add openjdk8">>"$(DOCKERFILE)"
	echo "ENV JAVA_HOME=/usr/lib/jvm/default-jvm">>"$(DOCKERFILE)"
	echo 'RUN ln -sf "$${JAVA_HOME}/bin/"* "/usr/bin" ' >>"$(DOCKERFILE)"

	# Add language specific file and build image
	make post DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)

haskell:
	$(eval LANG="haskell")
	$(eval DOCKERFILE="Dockerfile_Haskell")

	make pre DOCKERFILE=$(DOCKERFILE)

	# Haskell specific code
	echo "RUN apk --update add ghc">>"$(DOCKERFILE)"
	echo "RUN rm -rf /var/cache/apk/*">>"$(DOCKERFILE)"

	# Add language specific file and build image
	make post DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)

c:
	$(eval LANG="c")
	$(eval DOCKERFILE="Dockerfile_C")

	make pre DOCKERFILE=$(DOCKERFILE)

	# Haskell specific code
	echo "RUN apk --no-cache  add gcc musl-dev">>"$(DOCKERFILE)"

	# Add language specific file and build image
	make post DOCKERFILE=$(DOCKERFILE) LANG=$(LANG)
