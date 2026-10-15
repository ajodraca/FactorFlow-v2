# Stage 1: build the owner interface bundle.
FROM node:22-slim AS interface
WORKDIR /build
COPY package.json package-lock.json vite.config.ts tsconfig.json \
     tailwind.config.js postcss.config.js ./
COPY web ./web
COPY design-system ./design-system
RUN npm ci && npm run build
# vite.config.ts writes to ../src/factorflow/api/static relative to web/,
# so the bundle lands in /build/src/factorflow/api/static.

# Stage 2: export the locked runtime dependency set, with hashes.
FROM python:3.12-slim AS lock
WORKDIR /lock
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv==0.12.10 \
 && uv export --locked --no-emit-project --format requirements.txt -o requirements.txt

# Stage 3: the release image.
FROM python:3.12-slim
WORKDIR /app
COPY --from=lock /lock/requirements.txt ./
RUN pip install --no-cache-dir --require-hashes -r requirements.txt
COPY pyproject.toml uv.lock ./
COPY src ./src
COPY --from=interface /build/src/factorflow/api/static ./src/factorflow/api/static
RUN pip install --no-cache-dir --no-deps .
CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"]
