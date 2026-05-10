"use server";

import { ShippingMethod } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCart, calculateCartTotals } from "@/lib/cart";
import { calculateOrderTotal, getShippingAmount } from "@/lib/checkout";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { isStripeConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validations";

export async function createCheckoutSession(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured. Update .env.local before using checkout.");
  }

  const parsed = checkoutSchema.safeParse({
    name: formData.get("name"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: String(formData.get("country") ?? "").toUpperCase(),
    phone: formData.get("phone"),
    shippingMethod: formData.get("shippingMethod")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid checkout details.");
  }

  const cart = await getCart(session.user.id);
  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const totals = calculateCartTotals(cart.items);
  const shippingAmount = getShippingAmount(parsed.data.shippingMethod);
  const total = calculateOrderTotal(totals.subtotal, shippingAmount);

  const address = await prisma.shippingAddress.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
      phone: parsed.data.phone
    }
  });

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      shippingAddressId: address.id,
      shippingMethod: parsed.data.shippingMethod,
      subtotal: totals.subtotal,
      shippingAmount,
      total,
      items: {
        create: cart.items.map((item) => ({
          productId: item.variant.productId,
          variantId: item.variantId,
          name: item.variant.product.name,
          variant: item.variant.name,
          unitPrice: item.variant.price,
          quantity: item.quantity
        }))
      }
    },
    include: {
      items: true
    }
  });

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/checkout`,
    customer_email: session.user.email,
    line_items: cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        product_data: {
          name: item.variant.product.name,
          description: item.variant.name
        },
        unit_amount: item.variant.price
      }
    })),
    metadata: {
      orderId: order.id
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: shippingAmount, currency: "usd" },
          display_name: prettyShippingLabel(parsed.data.shippingMethod)
        }
      }
    ]
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id }
  });

  redirect(checkoutSession.url ?? "/checkout");
}

export async function finalizeCheckout(sessionId: string) {
  if (!isStripeConfigured()) {
    return null;
  }

  const stripe = getStripe();
  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = stripeSession.metadata?.orderId;

  if (!orderId || stripeSession.payment_status !== "paid") {
    return null;
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!existingOrder) {
    return null;
  }

  if (existingOrder.status === "PAID") {
    return existingOrder;
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentStatus: stripeSession.payment_status,
      payment: {
        upsert: {
          create: {
            provider: "stripe",
            providerRef: stripeSession.id,
            amount: stripeSession.amount_total ?? 0,
            status: stripeSession.payment_status
          },
          update: {
            amount: stripeSession.amount_total ?? 0,
            status: stripeSession.payment_status
          }
        }
      }
    },
    include: {
      user: true
    }
  });

  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId: order.userId
      }
    }
  });

  if (order.user.email) {
    await sendOrderConfirmationEmail(order.user.email, order.id);
  }

  return order;
}

function prettyShippingLabel(method: ShippingMethod) {
  switch (method) {
    case "EXPRESS":
      return "Express Delivery";
    case "WHITE_GLOVE":
      return "White Glove Delivery";
    default:
      return "Standard Delivery";
  }
}
