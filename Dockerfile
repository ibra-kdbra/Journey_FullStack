FROM ubuntu:20.04


#System setup
RUN apt-get update && apt-get install -y jq sudo curl wget gnupg build-essential git

#install homebrew and netstat
RUN apt-get install -y build-essential procps curl file git
RUN apt-get install net-tools

#Node.js using Ubuntu

RUN curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

RUN apt-get clean && rm -rf /var/lib/apt/lists/*;

#Create app directory
RUN mkdir -p /app
WORKDIR /app

#setup environment
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

#install dependencies from the committed lockfile (fails if it is out of sync with package.json)
COPY package.json package-lock.json /app/
RUN npm ci

#copy project to work directory
COPY . /app

EXPOSE 3000
CMD ["npm", "start"]
