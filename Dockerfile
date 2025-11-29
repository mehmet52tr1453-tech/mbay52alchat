FROM node:18-alpine

WORKDIR /app

# Backend dosyalarını kopyala
COPY backend/package*.json ./
RUN npm install

COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]
