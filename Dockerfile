FROM node:22-alpine

WORKDIR /app


# Copy the package files from your current folder into the container
COPY package*.json ./

RUN npm install

# Copy all your project files from your current folder into the container
COPY . .

# Expose the correct port matching your index.js config
EXPOSE 4000

CMD ["node", "index.js"]