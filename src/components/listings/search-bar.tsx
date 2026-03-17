"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, Scissors, Building2, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchTab = "salons" | "hotels" | "doctors";

const tabs: { id: SearchTab; label: string; icon: typeof Scissors }[] = [
  { id: "salons", label: "Salons", icon: Scissors },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
];

const tabColors: Record<SearchTab, string> = {
  salons: "text-pink-500 border-pink-500",
  hotels: "text-blue-500 border-blue-500",
  doctors: "text-emerald-500 border-emerald-500",
};

const searchBtnColors: Record<SearchTab, string> = {
  salons: "bg-pink-500 hover:bg-pink-600",
  hotels: "bg-blue-500 hover:bg-blue-600",
  doctors: "bg-emerald-500 hover:bg-emerald-600",
};

export function SearchBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>("salons");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("city", location);
    if (activeTab === "hotels") {
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      if (guests) params.set("guests", guests);
    } else {
      if (date) params.set("date", date);
    }
    router.push(`/${activeTab}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border-2",
                isActive
                  ? `${tabColors[tab.id]} bg-white shadow-sm`
                  : "border-transparent text-white/80 hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Box */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-2"
      >
        <div className="flex flex-wrap md:flex-nowrap items-stretch gap-0">
          {/* Query */}
          <div className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 border-r border-gray-100">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <label className="text-xs font-semibold text-gray-500 block">
                {activeTab === "salons"
                  ? "Service or style"
                  : activeTab === "hotels"
                  ? "Hotel name"
                  : "Doctor or specialty"}
              </label>
              <Input
                className="border-0 p-0 h-auto text-sm focus-visible:ring-0 placeholder:text-gray-400"
                placeholder={
                  activeTab === "salons"
                    ? "Haircut, color, massage..."
                    : activeTab === "hotels"
                    ? "Any hotel..."
                    : "General practitioner..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 border-r border-gray-100">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <label className="text-xs font-semibold text-gray-500 block">Location</label>
              <Input
                className="border-0 p-0 h-auto text-sm focus-visible:ring-0 placeholder:text-gray-400"
                placeholder="City, neighborhood..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Date/Time fields */}
          <AnimatePresence mode="wait">
            {activeTab === "hotels" ? (
              <motion.div
                key="hotel-dates"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-stretch"
              >
                <div className="flex items-center gap-3 px-4 py-3 border-r border-gray-100">
                  <Calendar className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block">Check in</label>
                    <input
                      type="date"
                      className="text-sm text-gray-700 border-0 p-0 outline-none bg-transparent"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 border-r border-gray-100">
                  <Calendar className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block">Check out</label>
                    <input
                      type="date"
                      className="text-sm text-gray-700 border-0 p-0 outline-none bg-transparent"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 border-r border-gray-100">
                  <Users className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block">Guests</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      className="border-0 p-0 h-auto w-16 text-sm focus-visible:ring-0"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="date"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 px-4 py-3 border-r border-gray-100"
              >
                <Calendar className="h-5 w-5 text-gray-400 shrink-0" />
                <div>
                  <label className="text-xs font-semibold text-gray-500 block">Date</label>
                  <input
                    type="date"
                    className="text-sm text-gray-700 border-0 p-0 outline-none bg-transparent"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Button */}
          <div className="flex items-center px-2">
            <Button
              onClick={handleSearch}
              size="lg"
              className={cn(
                "rounded-xl text-white font-semibold px-8",
                searchBtnColors[activeTab]
              )}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
