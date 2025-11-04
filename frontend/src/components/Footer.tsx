import { Shield, Github, Twitter } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const Footer = () => {
  const [globalProgress, setGlobalProgress] = useState(65);
  
  useEffect(() => {
    // Simulate auction platform activity
    const interval = setInterval(() => {
      setGlobalProgress((prev) => {
        const change = Math.random() * 4 - 2;
        const newValue = prev + change;
        return Math.max(20, Math.min(95, newValue));
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Platform Activity</span>
            </div>
            <span className="text-sm text-muted-foreground">{globalProgress.toFixed(0)}% Active</span>
          </div>
          <Progress 
            value={globalProgress} 
            className="h-2 transition-all duration-1000"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Real-time auction engagement across the platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold mb-3 text-foreground">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hidden Auction Market provides a secure, transparent platform for encrypted bidding. 
              Fair auctions, fully encrypted.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold mb-3 text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Active Auctions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold mb-3 text-foreground">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 Hidden Auction Market. All auctions secured by blockchain technology.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
