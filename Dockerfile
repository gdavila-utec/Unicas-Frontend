FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Build the app
RUN yarn build

# Expose port
EXPOSE 3000q

# Start the app
CMD ["yarn", "start"]
