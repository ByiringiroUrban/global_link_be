FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache vips-dev

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run db:generate && npm run build

RUN mkdir -p uploads

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
