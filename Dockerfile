FROM node:10.6.0-alpine
WORKDIR /app
ADD . /app
RUN npm install
ENV AC_TOKEN="NDQ2NzM2MzA3MTcyMDE2MTM4.Dib6CQ.yYRlUXMNAlJirqA1mT3gpUAKlpo"
ENV AC_PREFIX="="
RUN npm start
