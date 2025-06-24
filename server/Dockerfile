FROM node:18

WORKDIR /app

COPY package*.json ./

# Cài react 18 trước để tránh lỗi xung đột phụ thuộc
RUN npm install react@18 react-dom@18

# Tiếp tục cài các gói còn lại, dùng --legacy-peer-deps để bỏ qua lỗi xung đột
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
