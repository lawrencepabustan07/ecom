import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { createProduct, deleteProduct, setUserBlockedState, updateOrderStatus, updateProduct } from "@/actions/admin-actions";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/access";
import { summarizeOrderStatuses, summarizeTopProducts } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!isAdminRole(session.user.role) || session.user.isBlocked) {
    redirect("/account");
  }

  const [adminCount, customerCount, orderCount, lowStockVariants, recentOrders, revenueSummary, categories, products, users, allOrders, orderItems, recentCustomers] =
    await Promise.all([
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.order.count(),
      prisma.productVariant.findMany({
        where: {
          inventory: {
            quantity: {
              lte: 5
            }
          }
        },
        include: {
          product: true,
          inventory: true
        },
        take: 5
      }),
      prisma.order.findMany({
        include: {
          user: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 8
      }),
      prisma.order.aggregate({
        _sum: {
          total: true
        },
        where: {
          status: "PAID"
        }
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" }
      }),
      prisma.product.findMany({
        include: {
          category: true,
          images: true,
          variants: {
            include: {
              inventory: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 8
      }),
      prisma.user.findMany({
        where: {
          role: "customer"
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 8
      }),
      prisma.order.findMany({
        select: {
          status: true,
          total: true
        }
      }),
      prisma.orderItem.findMany({
        select: {
          name: true,
          quantity: true,
          unitPrice: true
        }
      }),
      prisma.user.findMany({
        where: {
          role: "customer"
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      })
    ]);

  const orderStatusSummary = summarizeOrderStatuses(allOrders);
  const topProducts = summarizeTopProducts(orderItems).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Admin</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-900">Operations dashboard</h1>
          <p className="mt-4 max-w-2xl text-stone-700">
            Monitor commerce activity, adjust catalog data, and manage customer access from one admin-only surface.
          </p>
        </div>
        <Link href="/products" className="button-secondary inline-flex">
          View storefront
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-black/10 bg-white/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Admins</p>
          <p className="mt-4 font-serif text-4xl text-stone-900">{adminCount}</p>
        </div>
        <div className="rounded-[2rem] border border-black/10 bg-white/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Customers</p>
          <p className="mt-4 font-serif text-4xl text-stone-900">{customerCount}</p>
        </div>
        <div className="rounded-[2rem] border border-black/10 bg-white/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Orders</p>
          <p className="mt-4 font-serif text-4xl text-stone-900">{orderCount}</p>
        </div>
        <div className="rounded-[2rem] border border-black/10 bg-stone-900 p-6 text-stone-100">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Paid revenue</p>
          <p className="mt-4 font-serif text-4xl">{formatPrice(revenueSummary._sum.total ?? 0)}</p>
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl text-stone-900">Order management</h2>
            <p className="text-sm uppercase tracking-[0.18em] text-stone-500">{recentOrders.length} recent orders</p>
          </div>
          <div className="mt-6 space-y-4">
            {recentOrders.map((order) => (
              <form key={order.id} action={updateOrderStatus} className="rounded-[1.5rem] border border-black/10 p-5">
                <input type="hidden" name="orderId" value={order.id} />
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{order.user.email}</p>
                    <p className="text-sm text-stone-600">{order.id}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone-500">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select name="status" defaultValue={order.status} className="field min-w-44">
                      {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="button-secondary">
                      Update order
                    </button>
                  </div>
                </div>
              </form>
            ))}
            {recentOrders.length === 0 ? <p className="text-stone-600">No orders have been placed yet.</p> : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
          <h2 className="font-serif text-3xl text-stone-900">Low stock</h2>
          <div className="mt-6 space-y-4">
            {lowStockVariants.map((variant) => (
              <div key={variant.id} className="rounded-[1.5rem] border border-black/10 p-5">
                <p className="font-medium text-stone-900">{variant.product.name}</p>
                <p className="mt-1 text-sm text-stone-600">{variant.name}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-stone-500">
                  {variant.inventory?.quantity ?? 0} units remaining
                </p>
              </div>
            ))}
            {lowStockVariants.length === 0 ? <p className="text-stone-600">No low-stock variants right now.</p> : null}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl text-stone-900">Order status report</h2>
            <p className="text-sm uppercase tracking-[0.18em] text-stone-500">Current pipeline</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(orderStatusSummary).map(([status, summary]) => (
              <div key={status} className="rounded-[1.5rem] border border-black/10 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{status}</p>
                <p className="mt-3 font-serif text-3xl text-stone-900">{summary.count}</p>
                <p className="mt-2 text-sm text-stone-600">{formatPrice(summary.revenue)} processed value</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white/60 p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl text-stone-900">Top products</h2>
            <p className="text-sm uppercase tracking-[0.18em] text-stone-500">By realized revenue</p>
          </div>
          <div className="mt-6 space-y-4">
            {topProducts.map((product) => (
              <div key={product.name} className="rounded-[1.5rem] border border-black/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-900">{product.name}</p>
                    <p className="text-sm text-stone-600">{product.units} units sold</p>
                  </div>
                  <p className="text-stone-900">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 ? <p className="text-stone-600">No product sales have been recorded yet.</p> : null}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-[2rem] border border-black/10 bg-white/60 p-8">
        <h2 className="font-serif text-3xl text-stone-900">Add product</h2>
        <form action={createProduct} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" placeholder="Product name" className="field" />
            <input name="slug" placeholder="product-slug" className="field" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="brand" placeholder="Brand" className="field" />
            <select name="categoryId" className="field" defaultValue="">
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <textarea name="description" placeholder="Description" className="field min-h-28" />
          <textarea name="details" placeholder="Details" className="field min-h-28" />
          <div className="grid gap-4 md:grid-cols-4">
            <input name="price" type="number" min="0" step="0.01" placeholder="Price USD" className="field" />
            <input name="compareAt" type="number" min="0" step="0.01" placeholder="Compare at USD" className="field" />
            <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue="4.5" className="field" />
            <input name="reviewCount" type="number" min="0" defaultValue="0" className="field" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input name="imageUrl" placeholder="Image URL" className="field" />
            <input name="imageAlt" placeholder="Image alt text" className="field" />
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            <input name="variantName" placeholder="Variant name" className="field" />
            <input name="color" placeholder="Color" className="field" />
            <input name="size" placeholder="Size" className="field" />
            <input name="sku" placeholder="SKU" className="field" />
            <input name="inventory" type="number" min="0" placeholder="Inventory" className="field" />
          </div>
          <label className="flex items-center gap-3 text-sm text-stone-700">
            <input type="hidden" name="featured" value="false" />
            <input type="checkbox" name="featured" value="true" />
            Feature this product on the homepage
          </label>
          <button type="submit" className="button-primary w-full sm:w-fit">
            Create product
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-[2rem] border border-black/10 bg-white/60 p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl text-stone-900">Product management</h2>
          <p className="text-sm uppercase tracking-[0.18em] text-stone-500">{products.length} products shown</p>
        </div>
        <div className="mt-6 space-y-6">
          {products.map((product) => {
            const primaryImage = product.images[0];
            const primaryVariant = product.variants[0];

            return (
              <form key={product.id} action={updateProduct} className="rounded-[1.5rem] border border-black/10 p-5">
                <input type="hidden" name="productId" value={product.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="name" defaultValue={product.name} className="field" />
                  <input name="slug" defaultValue={product.slug} className="field" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input name="brand" defaultValue={product.brand} className="field" />
                  <select name="categoryId" defaultValue={product.categoryId} className="field">
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea name="description" defaultValue={product.description} className="field mt-4 min-h-24" />
                <textarea name="details" defaultValue={product.details} className="field mt-4 min-h-24" />
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <input name="price" type="number" min="0" step="0.01" defaultValue={product.price / 100} className="field" />
                  <input
                    name="compareAt"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product.compareAt ? product.compareAt / 100 : ""}
                    className="field"
                  />
                  <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product.rating} className="field" />
                  <input name="reviewCount" type="number" min="0" defaultValue={product.reviewCount} className="field" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <input name="imageUrl" defaultValue={primaryImage?.url ?? ""} className="field" />
                  <input name="imageAlt" defaultValue={primaryImage?.alt ?? ""} className="field" />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-5">
                  <input name="variantName" defaultValue={primaryVariant?.name ?? ""} className="field" />
                  <input name="color" defaultValue={primaryVariant?.color ?? ""} className="field" />
                  <input name="size" defaultValue={primaryVariant?.size ?? ""} className="field" />
                  <input name="sku" defaultValue={primaryVariant?.sku ?? ""} className="field" />
                  <input
                    name="inventory"
                    type="number"
                    min="0"
                    defaultValue={primaryVariant?.inventory?.quantity ?? 0}
                    className="field"
                  />
                </div>
                <label className="mt-4 flex items-center gap-3 text-sm text-stone-700">
                  <input type="hidden" name="featured" value="false" />
                  <input type="checkbox" name="featured" value="true" defaultChecked={product.featured} />
                  Feature this product
                </label>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="submit" className="button-secondary">
                    Save product
                  </button>
                  <button formAction={deleteProduct} type="submit" className="button-secondary">
                    Delete product
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-black/10 bg-white/60 p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl text-stone-900">Customer management</h2>
          <p className="text-sm uppercase tracking-[0.18em] text-stone-500">{users.length} customers shown</p>
        </div>
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {recentCustomers.map((user) => (
              <div key={user.id} className="rounded-[1.5rem] border border-black/10 p-5">
                <p className="font-medium text-stone-900">{user.email}</p>
                <p className="mt-2 text-sm text-stone-600">Joined {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(user.createdAt)}</p>
              </div>
            ))}
          </div>
          {users.map((user) => (
            <form key={user.id} action={setUserBlockedState} className="rounded-[1.5rem] border border-black/10 p-5">
              <input type="hidden" name="userId" value={user.id} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-stone-900">{user.email}</p>
                  <p className="text-sm text-stone-600">{user.name ?? "No profile name"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${user.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                  <button
                    type="submit"
                    name="mode"
                    value={user.isBlocked ? "unblock" : "block"}
                    className="button-secondary"
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
