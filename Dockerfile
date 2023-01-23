FROM node

# Create app directory
WORKDIR /app

# Add package.json
COPY package.json .

# Install 
RUN npm i

# Copy source to /app
COPY . .

# Expose port
EXPOSE 3000


CMD ["npm", "run", "dev"]