FROM node:16-alpine
LABEL maintainer="Felippe Chemello"
LABEL org.opencontainers.image.source https://github.com/felippechemello/sync.video

WORKDIR /usr/src/app

COPY ./ ./
RUN yarn

EXPOSE 80

CMD ["yarn", "start"]