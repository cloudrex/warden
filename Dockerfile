FROM resin/raspberry-pi-node:onbuild
WORKDIR /app
ADD . /app
RUN npm install
ENV token="NDQ2NzM2MzA3MTcyMDE2MTM4.Dib6CQ.yYRlUXMNAlJirqA1mT3gpUAKlpo"
ENV prefix="."
RUN npm start
