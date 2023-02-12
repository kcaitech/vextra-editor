FROM node:16.19.0-alpine
EXPOSE 8000
WORKDIR /usr/app
COPY . .

#RUN npm ci --omit dev
#RUN npm install

ENTRYPOINT [ "node", "main.js", "--path" ]