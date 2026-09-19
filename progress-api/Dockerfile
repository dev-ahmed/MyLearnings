FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/data

EXPOSE 8700

CMD ["npm", "start"]
