FROM oven/bun:1.2.23
WORKDIR /app
COPY app/index.b1.tsx ./index.tsx
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "run", "index.tsx"]
