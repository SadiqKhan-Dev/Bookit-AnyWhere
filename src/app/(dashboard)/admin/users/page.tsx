import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";
import { getAdminUsers } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Users" };

interface Props {
  searchParams: { page?: string; search?: string };
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search ?? "";
  const { users, total, pages } = await getAdminUsers(page, 20, search);

  const roleColors: Record<string, string> = {
    CUSTOMER: "bg-gray-100 text-gray-700",
    PROVIDER: "bg-blue-100 text-blue-700",
    ADMIN: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-sm text-gray-500 mt-1">{total} total users</p>
            </div>
            <form method="GET" className="flex gap-2">
              <input
                name="search"
                defaultValue={search}
                placeholder="Search by name or email..."
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
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Bookings</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Listings</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Joined</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden shrink-0">
                          {u.imageUrl ? (
                            <Image src={u.imageUrl} alt="" width={32} height={32} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-500">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge className={`${roleColors[u.role] ?? ""} border-0 text-xs`}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-gray-600">{u._count.bookings}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-gray-600">{u._count.listings}</td>
                    <td className="px-5 py-4 hidden xl:table-cell text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <UserRoleSelect userId={u.id} currentRole={u.role} />
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
