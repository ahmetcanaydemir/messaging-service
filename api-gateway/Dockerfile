FROM node:lts-alpine AS build

WORKDIR /app
COPY ./package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build


FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules

EXPOSE 3000

ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]
