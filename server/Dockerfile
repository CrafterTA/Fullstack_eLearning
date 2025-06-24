FROM node:18

WORKDIR /app

# Nếu có xung đột, bỏ file lock để npm tự xử lý
COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
