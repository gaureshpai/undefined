
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "./icons";

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Icons.logo className="h-6 w-6" />
      <span className="inline-block font-bold">{siteConfig.name}</span>
    </Link>
  );
}
