FROM xuntian/node:10.1-npm-5.6-yarn-1.6
MAINTAINER xuntian li.zq@foxmail.com

COPY ./ /code/
WORKDIR /code
RUN npm run serve_build
CMD npm run start
