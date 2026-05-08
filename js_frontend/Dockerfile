FROM node:22-alpine

WORKDIR /home/app
COPY app/package.json app/package-lock.json* ./
RUN npm install
COPY app .

EXPOSE 3000
CMD ["npm", "run", "dev"]
