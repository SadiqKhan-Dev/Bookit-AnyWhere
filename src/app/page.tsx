import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Scissors, Building2, Stethoscope, Star, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SearchBar } from "@/components/listings/search-bar";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { searchListings } from "@/actions/listing";

export const dynamic = "force-dynamic";

async function FeaturedListings() {
  const { data: listings } = await searchListings({
    pageSize: 6,
    sortBy: "relevance",
  });

  if (!listings.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing, i) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          slug={listing.slug}
          type={listing.type}
          title={listing.title}
          city={listing.city}
          state={listing.state}
          coverImage={listing.coverImage}
          priceFrom={listing.priceFrom}
          rating={listing.rating}
          reviewCount={listing.reviewCount}
          isFeatured={listing.isFeatured}
          index={i}
        />
      ))}
    </div>
  );
}

const categories = [
  {
    id: "salons",
    title: "Beauty Salons",
    description: "Hair, nails, skin & wellness",
    href: "/salons",
    icon: Scissors,
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50",
    textColor: "text-pink-600",
    stats: "2,400+ salons",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
  },
  {
    id: "hotels",
    title: "Hotels & Stays",
    description: "Luxury rooms & suites",
    href: "/hotels",
    icon: Building2,
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    textColor: "text-blue-600",
    stats: "1,800+ hotels",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80",
  },
  {
    id: "doctors",
    title: "Medical Clinics",
    description: "Doctors, specialists & care",
    href: "/doctors",
    icon: Stethoscope,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    textColor: "text-emerald-600",
    stats: "3,200+ doctors",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant Confirmation",
    description: "Book in seconds with real-time availability and instant confirmation.",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Protected by Stripe. Your payment is safe and encrypted.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description: "Only real customers with completed bookings can leave reviews.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Globe,
    title: "Free Cancellation",
    description: "Plans change. Most bookings offer free cancellation up to 24h before.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
];

const stats = [
  { label: "Happy customers", value: "50K+" },
  { label: "Verified listings", value: "7,400+" },
  { label: "Cities covered", value: "120+" },
  { label: "5-star reviews", value: "180K+" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full px-4 py-1.5 text-sm mb-6 border border-white/20">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              Trusted by 50,000+ happy customers
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Book anything,
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                anywhere, instantly
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              One platform for salon appointments, hotel rooms, and doctor consultations.
              Real-time availability, instant confirmation.
            </p>

            <SearchBar />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What are you looking for?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From beauty treatments to hotel stays and medical care — we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link key={cat.id} href={cat.href} className="group block">
                  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.bgGradient} border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={cat.image}
                        alt={cat.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className={`absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cat.gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{cat.title}</h3>
                        <ArrowRight className={`h-5 w-5 ${cat.textColor} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{cat.description}</p>
                      <span className={`text-xs font-semibold ${cat.textColor} bg-white/80 px-2.5 py-1 rounded-full`}>
                        {cat.stats}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured listings</h2>
              <p className="text-gray-500 mt-1">Hand-picked top-rated places</p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <FeaturedListings />
          </Suspense>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why choose BookIt?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We built the booking experience you always deserved.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} mb-4`}>
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to list your business?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
            Join thousands of providers on BookIt. Reach more customers, manage bookings effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="xl" className="bg-white text-rose-600 hover:bg-white/90 font-semibold">
                Get started free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
