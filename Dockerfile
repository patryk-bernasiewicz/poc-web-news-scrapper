FROM node:20-alpine

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json package-lock.json ./

# delete husky part from package.json - not needed in prod
RUN npm pkg delete scripts.prepare
RUN npm ci --omit=dev

# Skopiuj pliki potrzebne do działania Prisma
COPY prisma ./prisma

# Synchronizuj schemat bazy z rzeczywistą bazą danych
RUN npx prisma db pull

# Wygeneruj klienta Prisma
RUN npx prisma generate

COPY .next ./.next
COPY public ./public
COPY next.config.ts ./
COPY tsconfig.json ./
COPY src ./src

ENV PORT=3300

EXPOSE 3300

CMD ["npm", "start", "--", "-p", "3300"]