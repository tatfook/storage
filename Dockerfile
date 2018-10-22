FROM node:8

RUN mkdir -p /code
WORKDIR /code
ADD package.json /code/package.json
RUN npm install

ARG BUILD_ENV
ARG KEEPWORK_LOCALE

COPY ./ /code/
# RUN npm run serve_build
CMD NODE_ENV=${BUILD_ENV} KEEPWORK_LOCALE=${KEEPWORK_LOCALE} npm start
