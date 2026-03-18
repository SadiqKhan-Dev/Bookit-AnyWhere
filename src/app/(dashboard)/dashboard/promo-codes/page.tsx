import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Tag, TrendingUp, ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { CreatePromoForm } from "@/components/dashboard/create-promo-form";
import { PromoActions } from "@/components/dashboard/promo-actions";
import { getMyPromoCodes } from "@/actions/promo";
import { getCurrentUser } from "@/actions/user";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Promo Codes" };

export default async function PromoCodesPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const [user, codes] = await Promise.all([getCurrentUser(), getMyPromoCodes()]);
  if (!user) redirect("/sign-in");
  if (user.role === "CUSTOMER") redirect("/dashboard");

  const active = codes.filter((c) => c.isActive).length;
  const totalUses = codes.reduce((s, c) => s + c.usedCount, 0);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
              <p className="text-sm text-gray-500 mt-1">Create discount codes for your listings</p>
            </div>
            <CreatePromoForm />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Codes", value: codes.length, icon: Tag, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Active", value: active, icon: ToggleLeft, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Total Uses", value: totalUses, icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-4`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          {codes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Tag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No promo codes yet</h3>
              <p className="text-sm text-gray-500">Create your first promo code to offer discounts to customers.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Uses</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Expires</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {codes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-mono font-bold text-gray-900">{code.code}</p>
                          {code.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{code.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {code.discountType === "PERCENTAGE"
                          ? `${code.discountValue}% off`
                          : `${formatCurrency(code.discountValue)} off`}
                        {code.minOrderAmount && (
                          <p className="text-xs text-gray-400 font-normal">
                            Min {formatCurrency(code.minOrderAmount)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-gray-600">
                        {code.usedCount}
                        {code.maxUses && <span className="text-gray-400">/{code.maxUses}</span>}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-gray-500">
                        {code.expiresAt ? formatDate(code.expiresAt) : "Never"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={code.isActive
                          ? "bg-emerald-100 text-emerald-700 border-0"
                          : "bg-gray-100 text-gray-500 border-0"}>
                          {code.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <PromoActions id={code.id} isActive={code.isActive} usedCount={code.usedCount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
