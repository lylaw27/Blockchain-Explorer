FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
ENV NEXT_PUBLIC_IP_ADDRESS="54.169.134.66:8080"
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
