FROM node:20-alpine

WORKDIR /app

# Copy package management files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the dev server
CMD ["npm", "run", "dev"]