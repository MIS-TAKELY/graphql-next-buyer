import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground pt-12 md:pt-16 pb-8 border-t border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">DAI Buyer</h3>
            <p className="text-sm max-w-xs leading-relaxed">
              Experience the best in e-commerce with our premium selection of products. Quality, trust, and speed delivered to your doorstep.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="/" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Facebook className="w-5 h-5" /></Link>
              <Link href="/" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Instagram className="w-5 h-5" /></Link>
              <Link href="/" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Twitter className="w-5 h-5" /></Link>
              <Link href="/" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Linkedin className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Press</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Cancellation & Returns</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} DAI Buyer. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-primary cursor-pointer">Sitemap</span>
            <span className="hover:text-primary cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
