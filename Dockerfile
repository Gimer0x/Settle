FROM node:20-alpine

COPY . /app

WORKDIR /app

RUN npm install --non-interactive --frozen-lockfile

COPY $PWD/docker/entrypoint.sh /usr/local/bin
ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]

EXPOSE 8545