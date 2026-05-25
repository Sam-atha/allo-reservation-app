# Allo Inventory Reservation App

A Next.js App Router application for inventory reservation across warehouses.

## Stack
- Next.js App Router
- TypeScript
- Prisma
- Neon PostgreSQL
- Tailwind CSS

## Features
- List products with warehouse stock
- Reserve stock during checkout
- Confirm reservation after payment
- Cancel reservation and release stock
- Expired reservation cleanup endpoint
- 409 error for insufficient stock
- 410 error for expired confirmation

## Concurrency
Reservation creation uses an atomic SQL update:

UPDATE Inventory
SET reservedQuantity = reservedQuantity + quantity
WHERE productId = ...
AND warehouseId = ...
AND totalQuantity - reservedQuantity >= quantity

This ensures two simultaneous requests cannot reserve the same last unit. Only one update succeeds.

## Expiry
Reservations are created with a 10 minute expiresAt value.

Expired reservations can be released by calling:

POST /api/cron/release-expired

In production, this endpoint can be triggered by Vercel Cron every minute.

## Run locally
```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev