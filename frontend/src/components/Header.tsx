import { Button } from "@/components/ui/button";
import logo from "@/assets/auction-lock-logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Hidden Auction Market" className="h-10 w-10" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground">Hidden Auction Market</h1>
              <p className="text-xs text-muted-foreground">Fair Auctions, Fully Encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectButton chainStatus="icon" accountStatus="address" showBalance={false} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
