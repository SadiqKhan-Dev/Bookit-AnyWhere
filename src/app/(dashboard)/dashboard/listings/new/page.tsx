import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { CreateListingForm } from "@/components/dashboard/create-listing-form";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { getCurrentUser } from "@/actions/user";

export const metadata: Metadata = {
  title: "Create New Listing",
};

export default async function NewListingPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "PROVIDER" && user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar user={user} />

      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create a new listing</h1>
          <p className="text-gray-500 mb-8">Fill in the details to publish your business on BookIt</p>
          <CreateListingForm />
        </div>
      </main>
    </div>
  );
}
