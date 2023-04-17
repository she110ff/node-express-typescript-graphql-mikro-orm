FROM node:16-alpine as ts-compiler
RUN npm install -g typescript@4.9.4
# Create app directory
WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install -g npm@9.4.0
RUN npm install
COPY . ./
RUN npm run build

FROM node:16-alpine as ts-remover
WORKDIR /usr/app
COPY --from=ts-compiler /usr/app/package*.json  ./
COPY --from=ts-compiler /usr/app/dist ./
RUN mkdir -p ./temp_image
RUN npm install -g npm@9.4.0
RUN npm install
EXPOSE 4001
CMD ["node", "index.js"]