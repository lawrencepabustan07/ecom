import { prisma } from "./prisma";

export async function getOrCreateCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              inventory: true,
              product: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      }
    }
  });

  return cart;
}

export async function getCart(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              inventory: true,
              product: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      }
    }
  });
}

export function calculateCartTotals(
  items: Array<{
    quantity: number;
    variant: {
      price: number;
    };
  }>
) {
  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

  return {
    subtotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

export function assertInventory(quantity: number, available: number) {
  if (quantity > available) {
    throw new Error("Requested quantity exceeds available inventory.");
  }
}
