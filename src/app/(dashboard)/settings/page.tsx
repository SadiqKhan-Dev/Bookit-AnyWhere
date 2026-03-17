import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UpdateProfileForm } from "@/components/dashboard/update-profile-form";
import { getCurrentUser } from "@/actions/user";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.imageUrl || ""} />
                  <AvatarFallback className="text-xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <Badge className="mt-1 bg-gray-100 text-gray-700">{user.role}</Badge>
                </div>
              </div>
              <Separator className="mb-6" />
              <UpdateProfileForm user={user} />
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Delete Account</p>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <button className="text-sm text-red-500 hover:text-red-700 font-medium underline">
                  Delete account
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
