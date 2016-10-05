# Set the base image to Ubuntu
FROM ubuntu

# File Author / Maintainer
MAINTAINER Sean Davis

# Install Node.js and other dependencies
RUN apt-get update && \
    apt-get -y install curl sudo && \
    curl -sL https://deb.nodesource.com/setup | sudo bash - && \
    apt-get -y install python build-essential nodejs npm && \
	ln -s /usr/bin/nodejs /usr/bin/node

# Install nodemon
RUN npm install -g nodemon

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

# Expose port
#EXPOSE 3000

# Run app using nodemon
CMD ["nodemon", "/src/app.js"]
