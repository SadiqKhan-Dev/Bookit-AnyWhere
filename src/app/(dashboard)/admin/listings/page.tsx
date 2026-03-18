import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ListingToggle } from "@/components/admin/listing-toggle";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";
import { getAdminListings } from "@/actions/admin";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Listings" };

interface Props {
  searchParams: { page?: string; search?: string };
}

const typeColors: Record<string, string> = {
  SALON: "bg-pink-100 text-pink-700",
  HOTEL: "bg-blue-100 text-blue-700",
  MEDICAL: "bg-emerald-100 text-emerald-700",
  AIRPORT: "bg-sky-100 text-sky-700",
  FLIGHT: "bg-violet-100 text-violet-700",
  CRUISE: "bg-teal-100 text-teal-700",
};

export default async function AdminListingsPage({ searchParams }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search ?? "";
  const { listings, total, pages } = await getAdminListings(page, 20, search);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
              <p className="text-sm text-gray-500 mt-1">{total} total listings</p>
            </div>
            <form method="GET" className="flex gap-2">
              <input
                name="search"
                defaultValue={search}
                placeholder="Search by title or city..."
                className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 w-64 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-xl hover:bg-rose-600 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Listing</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Provider</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Bookings</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Price from</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={listing.coverImage}
                            alt={listing.title}
                            width={56}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/${listing.type.toLowerCase()}s/${listing.slug}`}
                            className="font-medium text-gray-900 hover:text-rose-600 transition-colors"
                          >
                            {listing.title}
                          </Link>
                          <p className="text-xs text-gray-400">{listing.city}, {listing.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge className={`${typeColors[listing.type] ?? ""} border-0 text-xs`}>{listing.type}</Badge>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-gray-700 text-xs">{listing.provider.firstName} {listing.provider.lastName}</p>
                      <p className="text-gray-400 text-xs">{listing.provider.email}</p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-gray-600">{listing._count.bookings}</td>
                    <td className="px-5 py-4 hidden xl:table-cell text-gray-600">{formatCurrency(listing.priceFrom)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge className={listing.isActive ? "bg-emerald-100 text-emerald-700 border-0 text-xs" : "bg-gray-100 text-gray-500 border-0 text-xs"}>
                          {listing.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {listing.isFeatured && (
                          <Badge className="bg-rose-100 text-rose-700 border-0 text-xs">Featured</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ListingToggle id={listing.id} isActive={listing.isActive} isFeatured={listing.isFeatured} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-rose-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
