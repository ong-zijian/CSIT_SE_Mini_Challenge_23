FROM node:18

WORKDIR /app
RUN npm install

ADD server.js server.js
ADD serverConn.js serverConn.js

EXPOSE 8080

# Start the application
CMD [ "node", "serverConn.js", "server.js" ]
