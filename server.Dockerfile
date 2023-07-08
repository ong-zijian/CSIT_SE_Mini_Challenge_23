FROM node:18

WORKDIR /app

ADD package*.json ./
ADD server.js server.js
ADD serverConn.js serverConn.js

# Install the application dependencies
RUN npm install

EXPOSE 8080

# Start the application
CMD [ "node", "./serverConn.js" ]
