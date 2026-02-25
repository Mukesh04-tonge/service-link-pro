# --------------------
# Stage 1: Build Frontend
# --------------------
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --------------------
# Stage 2: Run Backend
# --------------------
FROM node:18

WORKDIR /app

# Copy backend code
COPY server ./server

# Copy built frontend
COPY --from=build /app/dist ./dist

COPY package*.json ./
RUN npm install --production

EXPOSE 3001

CMD ["node", "server/server.js"]
