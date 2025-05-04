# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine
RUN mkdir -p /usr/src/tx-gallery-api && chown -R node:node /usr/src/tx-gallery-api

WORKDIR /usr/src/tx-gallery-api

COPY package*.json ./

USER node

RUN npm ci

COPY --chown=node:node . .

EXPOSE 3000