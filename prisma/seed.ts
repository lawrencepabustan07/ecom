import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.paymentRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Outerwear",
        slug: "outerwear",
        description: "Tailored layers for city evenings and cold departures."
      }
    }),
    prisma.category.create({
      data: {
        name: "Knitwear",
        slug: "knitwear",
        description: "Soft structure with high-end texture and clean silhouettes."
      }
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        description: "Finishing pieces designed to carry the look."
      }
    })
  ]);

  const catalog = [
    {
      name: "Nocturne Wool Coat",
      slug: "nocturne-wool-coat",
      description: "A double-faced wool overcoat cut with a sharp shoulder and fluid drape.",
      details: "Italian wool blend, satin half lining, horn buttons, tailored fit.",
      brand: "Atelier Meridian",
      price: 42000,
      compareAt: 48000,
      rating: 4.9,
      reviewCount: 42,
      featured: true,
      categoryId: categories[0].id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
          alt: "Model wearing a black wool coat."
        },
        {
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
          alt: "Close-up of structured outerwear."
        }
      ],
      variants: [
        { name: "Black / S", color: "Black", size: "S", sku: "NWC-BLK-S", price: 42000, quantity: 4 },
        { name: "Black / M", color: "Black", size: "M", sku: "NWC-BLK-M", price: 42000, quantity: 6 }
      ]
    },
    {
      name: "Gallery Cashmere Crew",
      slug: "gallery-cashmere-crew",
      description: "Lightweight cashmere knit with a relaxed shoulder and gallery-ready proportion.",
      details: "Pure cashmere, rib finish, straight hem, dry clean only.",
      brand: "Atelier Meridian",
      price: 24000,
      compareAt: null,
      rating: 4.8,
      reviewCount: 19,
      featured: true,
      categoryId: categories[1].id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
          alt: "Soft cashmere crew knit."
        }
      ],
      variants: [
        { name: "Ivory / S", color: "Ivory", size: "S", sku: "GCC-IVY-S", price: 24000, quantity: 8 },
        { name: "Ivory / M", color: "Ivory", size: "M", sku: "GCC-IVY-M", price: 24000, quantity: 5 }
      ]
    },
    {
      name: "Transit Leather Tote",
      slug: "transit-leather-tote",
      description: "Architectural tote with structured panels and enough volume for a day in motion.",
      details: "Full-grain leather, suede lining, magnetic closure, inner pocket.",
      brand: "Atelier Meridian",
      price: 28000,
      compareAt: 32000,
      rating: 4.7,
      reviewCount: 12,
      featured: false,
      categoryId: categories[2].id,
      images: [
        {
          url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          alt: "Structured designer tote."
        }
      ],
      variants: [
        { name: "Espresso / One Size", color: "Espresso", size: "One Size", sku: "TLT-ESP-OS", price: 28000, quantity: 7 }
      ]
    }
  ];

  for (const item of catalog) {
    await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        details: item.details,
        brand: item.brand,
        price: item.price,
        compareAt: item.compareAt,
        rating: item.rating,
        reviewCount: item.reviewCount,
        featured: item.featured,
        categoryId: item.categoryId,
        images: {
          create: item.images
        },
        variants: {
          create: item.variants.map((variant) => ({
            name: variant.name,
            color: variant.color,
            size: variant.size,
            sku: variant.sku,
            price: variant.price,
            inventory: {
              create: {
                quantity: variant.quantity,
                inStock: variant.quantity > 0
              }
            }
          }))
        }
      }
    });
  }

  const passwordHash = hashSync("Password123!", 10);
  const customer = await prisma.user.create({
    data: {
      name: "Sample Customer",
      email: "customer@example.com",
      passwordHash
    }
  });

  await prisma.shippingAddress.create({
    data: {
      userId: customer.id,
      name: "Sample Customer",
      line1: "18 Mercer Street",
      city: "New York",
      state: "NY",
      postalCode: "10013",
      country: "US",
      phone: "+1 212 555 0183"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
