FROM node:18

WORKDIR /app

ADD package*.json ./
ADD server2.js server2.js

# Install the application dependencies
RUN npm install

EXPOSE 8080

# Start the application
CMD [ "node", "./server2.js" ]
