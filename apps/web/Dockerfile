# Use Node.js LTS
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]
