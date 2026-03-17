import Link from "next/link";
import { Globe, Scissors, Building2, Stethoscope } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">BookIt</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              The all-in-one platform for booking salons, hotels, and medical appointments.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Explore</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/salons" className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                  <Scissors className="h-3.5 w-3.5" /> Salons
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <Building2 className="h-3.5 w-3.5" /> Hotels
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                  <Stethoscope className="h-3.5 w-3.5" /> Doctors
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
              <li><Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-gray-900 transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/help" className="hover:text-gray-900 transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BookIt. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/sitemap" className="hover:text-gray-900">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
