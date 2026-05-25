import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ProductWithInventory = {
  id: string;
  name: string;
  description: string | null;
  inventories: {
    warehouseId: string;
    totalQuantity: number;
    reservedQuantity: number;
    warehouse: {
      name: string;
      location: string;
    };
  }[];
};

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      inventories: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const formattedProducts = products.map((product: ProductWithInventory) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    warehouses: product.inventories.map((inventory) => ({
      warehouseId: inventory.warehouseId,
      warehouseName: inventory.warehouse.name,
      location: inventory.warehouse.location,
      totalQuantity: inventory.totalQuantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity:
        inventory.totalQuantity - inventory.reservedQuantity,
    })),
  }));

  return NextResponse.json(formattedProducts);
}