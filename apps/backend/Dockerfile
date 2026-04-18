FROM node:20-alpine

# Required by BuildWithLocus health check
RUN apk add --no-cache wget

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src/ ./src/
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]
