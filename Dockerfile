# Use Node.js LTS (Long Term Support) version
FROM node:20-slim

# Install FFmpeg and Google Noto fonts
RUN apt-get update && \
    apt-get install -y ffmpeg fonts-noto-cjk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Optionally set Noto Sans as default font for fontconfig (if needed for your app)
RUN apt-get update && apt-get install -y fontconfig && \
    echo "<?xml version='1.0'?><!DOCTYPE fontconfig SYSTEM 'fonts.dtd'><fontconfig><alias><family>sans-serif</family><prefer><family>Noto Sans</family></prefer></alias></fontconfig>" > /etc/fonts/local.conf

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
