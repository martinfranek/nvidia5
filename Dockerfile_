FROM mcr.microsoft.com/playwright:v1.50.1-noble

WORKDIR /app

RUN addgroup --gid 1002 app
RUN adduser --uid 1002 --disabled-password --no-create-home --ingroup app app

ADD . .

RUN npm install
RUN npm run build
RUN chown -R app:app .

USER 1002:1002

CMD ["node", "dist/server.js"]
