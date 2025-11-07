
import { MainNav } from "@/components/ui/main-nav";
import { UserNav } from "@/components/ui/user-nav";
import { MainNav } from "./main-nav";
import { UserAccountNav } from "./user-account-nav";
import { SiteLogo } from "./site-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <SiteLogo />
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <UserAccountNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
