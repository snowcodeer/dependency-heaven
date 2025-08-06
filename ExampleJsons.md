// Frontend package.json
{
  "name": "ecommerce-frontend",
  "version": "2.1.0",
  "description": "React frontend for e-commerce platform",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@next/font": "^14.1.0",
    "axios": "^1.6.7",
    "lodash": "^4.17.21",
    "@stripe/stripe-js": "^3.0.6",
    "react-query": "^3.39.3",
    "react-router-dom": "^6.8.1",
    "styled-components": "^6.1.8",
    "framer-motion": "^11.0.6",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "date-fns": "^3.3.1",
    "clsx": "^2.1.0",
    "lucide-react": "^0.321.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.19",
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@types/lodash": "^4.14.202",
    "@types/styled-components": "^5.1.34",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "prettier": "^3.2.5",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@testing-library/react": "^14.2.1",
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/user-event": "^14.5.2"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}

// Backend package.json
{
  "name": "ecommerce-backend",
  "version": "1.8.2",
  "description": "Node.js REST API for e-commerce platform",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "test": "jest --testPathIgnorePatterns=dist/",
    "test:watch": "jest --watch --testPathIgnorePatterns=dist/",
    "test:coverage": "jest --coverage --testPathIgnorePatterns=dist/",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "mongoose": "^8.1.1",
    "@prisma/client": "^5.9.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.12.1",
    "nodemailer": "^6.9.9",
    "stripe": "^14.17.0",
    "lodash": "^4.17.20",
    "axios": "^1.6.5",
    "redis": "^4.6.13",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "rate-limiter-flexible": "^4.0.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.2",
    "dotenv": "^16.4.1",
    "zod": "^3.22.2",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.17",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/nodemailer": "^6.4.14",
    "@types/lodash": "^4.14.202",
    "@types/morgan": "^1.9.9",
    "@types/compression": "^1.7.5",
    "@types/multer": "^1.4.11",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.3",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "prettier": "^3.2.5",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "@types/jest": "^29.5.12",
    "supertest": "^6.3.4",
    "@types/supertest": "^6.0.2",
    "prisma": "^5.9.1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "prisma": {
    "schema": "prisma/schema.prisma",
    "seed": "ts-node prisma/seed.ts"
  }
}