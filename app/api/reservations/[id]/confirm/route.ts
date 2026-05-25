import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json({ error: "Reservation already processed" }, { status: 400 });
    }

    if (reservation.expiresAt < new Date()) {
      return NextResponse.json({ error: "Reservation expired" }, { status: 410 });
    }

    await prisma.$executeRaw`
      UPDATE "Inventory"
      SET 
        "totalQuantity" = "totalQuantity" - ${reservation.quantity},
        "reservedQuantity" = "reservedQuantity" - ${reservation.quantity}
      WHERE "productId" = ${reservation.productId}
      AND "warehouseId" = ${reservation.warehouseId}
    `;

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}