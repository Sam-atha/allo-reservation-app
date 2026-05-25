import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const expired = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const reservation of expired) {
    await prisma.$executeRaw`
      UPDATE "Inventory"
      SET "reservedQuantity" = "reservedQuantity" - ${reservation.quantity}
      WHERE "productId" = ${reservation.productId}
      AND "warehouseId" = ${reservation.warehouseId}
      AND "reservedQuantity" >= ${reservation.quantity}
    `;

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "RELEASED" },
    });
  }

  return NextResponse.json({
    released: expired.length,
  });
}