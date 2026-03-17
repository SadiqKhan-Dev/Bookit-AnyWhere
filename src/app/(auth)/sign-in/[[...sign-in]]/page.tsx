import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl rounded-2xl border-0",
            headerTitle: "text-2xl font-bold",
            formButtonPrimary: "bg-rose-500 hover:bg-rose-600",
            footerActionLink: "text-rose-500 hover:text-rose-600",
          },
        }}
      />
    </div>
  );
}
