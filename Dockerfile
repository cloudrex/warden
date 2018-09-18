FROM node:10
ENV TERM="xterm-256color"
WORKDIR /app
ADD . /app
RUN npm install
ENTRYPOINT ["npm", "start"]
