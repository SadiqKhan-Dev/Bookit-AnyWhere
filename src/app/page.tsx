import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Scissors, Building2, Stethoscope, PlaneLanding, Plane, Ship, Star, ArrowRight, Shield, Zap, Globe, Mountain, Waves, Sun, TreePine, Droplets, Anchor, MountainSnow, Leaf, Compass, CloudSnow, Wheat, MapPin, Navigation, HeartHandshake, UtensilsCrossed, Wrench, Camera, Flower2, Music } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SearchBar } from "@/components/listings/search-bar";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { searchListings } from "@/actions/listing";
import MapSection from "@/components/MapSection";

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
  {
    id: "flights",
    title: "Flights",
    description: "Domestic & international routes",
    href: "/flights",
    icon: Plane,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-50 to-purple-50",
    textColor: "text-violet-600",
    stats: "10,000+ routes",
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80",
  },
  {
    id: "cruises",
    title: "Cruise Vacations",
    description: "Luxury ship adventures",
    href: "/cruises",
    icon: Ship,
    gradient: "from-teal-500 to-cyan-600",
    bgGradient: "from-teal-50 to-cyan-50",
    textColor: "text-teal-600",
    stats: "200+ cruise ships",
    image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&q=80",
  },
  {
    id: "marriage-halls",
    title: "Wedding Venues",
    description: "Marriage halls & banquet halls",
    href: "/marriage-halls",
    icon: HeartHandshake,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    textColor: "text-amber-600",
    stats: "500+ venues",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
  },
  {
    id: "catering",
    title: "Catering Services",
    description: "Food & catering for events",
    href: "/catering",
    icon: UtensilsCrossed,
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-50 to-rose-50",
    textColor: "text-red-600",
    stats: "800+ caterers",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
  },
  {
    id: "mechanics",
    title: "Auto Mechanics",
    description: "Car repair & maintenance",
    href: "/mechanics",
    icon: Wrench,
    gradient: "from-slate-500 to-gray-600",
    bgGradient: "from-slate-50 to-gray-50",
    textColor: "text-slate-600",
    stats: "1,200+ mechanics",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80",
  },
  {
    id: "photography",
    title: "Photography",
    description: "Professional photo services",
    href: "/photography",
    icon: Camera,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    textColor: "text-purple-600",
    stats: "900+ photographers",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80",
  },
  {
    id: "decorators",
    title: "Event Decorators",
    description: "Decoration & styling services",
    href: "/decorators",
    icon: Flower2,
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-50 to-pink-50",
    textColor: "text-rose-600",
    stats: "600+ decorators",
    image: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&q=80",
  },
  {
    id: "musicians",
    title: "Musicians & DJs",
    description: "Live music & entertainment",
    href: "/musicians",
    icon: Music,
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50",
    textColor: "text-indigo-600",
    stats: "700+ musicians",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
  },
];

const terrainExplore = [
  { tag: "Mountain",    Icon: Mountain,    label: "Mountain",    color: "from-slate-500 to-gray-600",    desc: "Alpine retreats & ski resorts" },
  { tag: "Beach",       Icon: Waves,       label: "Beach",       color: "from-sky-400 to-blue-500",      desc: "Sun, sand & surf" },
  { tag: "City",        Icon: Building2,   label: "City",        color: "from-zinc-500 to-slate-600",    desc: "Urban hotspots & metropolis" },
  { tag: "Desert",      Icon: Sun,         label: "Desert",      color: "from-amber-500 to-orange-500",  desc: "Arid wonders & canyons" },
  { tag: "Forest",      Icon: TreePine,    label: "Forest",      color: "from-green-500 to-emerald-600", desc: "Woodland & nature escapes" },
  { tag: "Tropical",    Icon: Leaf,        label: "Tropical",    color: "from-lime-500 to-green-500",    desc: "Lush jungles & warm weather" },
  { tag: "Island",      Icon: Compass,     label: "Island",      color: "from-teal-500 to-cyan-500",     desc: "Remote isles & paradises" },
  { tag: "Coastal",     Icon: Anchor,      label: "Coastal",     color: "from-blue-500 to-indigo-500",   desc: "Seaside towns & harbors" },
  { tag: "Ski Resort",  Icon: MountainSnow,label: "Ski Resort",  color: "from-indigo-500 to-purple-500", desc: "Powder runs & chalets" },
  { tag: "Lake",        Icon: Droplets,    label: "Lake",        color: "from-cyan-500 to-teal-500",     desc: "Lakeside cabins & shores" },
  { tag: "Arctic",      Icon: CloudSnow,   label: "Arctic",      color: "from-purple-500 to-violet-500", desc: "Glaciers & polar adventures" },
  { tag: "Countryside", Icon: Wheat,       label: "Countryside", color: "from-yellow-500 to-amber-500",  desc: "Rolling hills & farmlands" },
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
              One platform for salons, hotels, doctors, wedding venues, catering, mechanics, photographers, decorators, musicians, flights & cruises.
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
              From salons, hotels, doctors, flights & cruises to wedding venues, catering, mechanics, photographers, decorators & musicians — we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {/* Explore by Terrain */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Explore by destination type
            </h2>
            <p className="text-gray-500">Find the perfect environment for your trip — mountain, beach, city, and beyond.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {terrainExplore.map((terrain) => {
              const { Icon } = terrain;
              return (
                <Link
                  key={terrain.tag}
                  href={`/hotels?tag=${encodeURIComponent(terrain.tag)}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${terrain.color} shadow-sm`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{terrain.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{terrain.desc}</p>
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

      {/* Location Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 rounded-full px-4 py-1.5 text-sm mb-4">
              <MapPin className="h-4 w-4" />
              Find businesses near you
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore locations on the map
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Discover businesses and services in your area. Click anywhere on the map to find providers near that location.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <MapSection center={[40.7128, -74.0060]} zoom={12} />
            
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>Click on map to select location</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-500" />
                <span>Enable GPS to find businesses near you</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
