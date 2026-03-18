"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MapViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMap = searchParams.get("view") === "map";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isMap) {
      params.delete("view");
    } else {
      params.set("view", "map");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Button
      variant={isMap ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      className={isMap ? "bg-rose-500 hover:bg-rose-600 text-white gap-2" : "gap-2"}
    >
      {isMap ? (
        <><LayoutGrid className="h-4 w-4" /> Grid view</>
      ) : (
        <><Map className="h-4 w-4" /> Map view</>
      )}
    </Button>
  );
}
