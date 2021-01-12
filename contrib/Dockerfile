ARG NODE_TAG=lts-alpine3.9

FROM node:${NODE_TAG} AS node

FROM node as builder
ENV NODE_ENV development
WORKDIR /usr/src/app
ADD . .
RUN npm install

FROM builder as dependencies
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN npm run build:prod

FROM node
ARG AUTHOR
ARG CREATED
ARG DESCRIPTION
ARG EMAIL
ARG LICENSES
ARG SOURCE
ARG TITLE
ARG VERSION
LABEL org.opencontainers.image.authors="${AUTHOR} <${EMAIL}>"
LABEL org.opencontainers.image.created=${CREATED}
LABEL org.opencontainers.image.description=${DESCRIPTION}
LABEL org.opencontainers.image.licenses=${LICENSES}
LABEL org.opencontainers.image.source=${SOURCE}
LABEL org.opencontainers.image.title=${TITLE}
LABEL org.opencontainers.image.version=${VERSION}

ARG DEBIAN_FRONTEND=noninteractive
RUN apk add -U tcptraceroute && \
    rm -rf /var/cache/apk/*
RUN chmod +s /usr/bin/tcptraceroute
RUN addgroup -S traceroute && \
    adduser -S -G traceroute traceroute
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/build/ .
COPY --from=dependencies /usr/src/app/package.json .
RUN npm install
USER traceroute
CMD [ "node", "bundle.js" ]
