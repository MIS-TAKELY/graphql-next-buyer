import { Facebook, Instagram, Twitter, Linkedin, Music4 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const initiatives = [
  {
    name: "UNDP Nepal",
    tagline: "Youth leading Nepal's green future",
    url: "https://www.undp.org/nepal",
    logo: "/UNDP-Vanijay-1.webp",
  },
  {
    name: "U-Report Nepal",
    tagline: "Your voice, amplified",
    url: "https://nepal.ureport.in/",
    logo: "/U-Report_Logo_EN.png",
  },
  {
    name: "UNICEF Nepal",
    tagline: "Stay safe Online",
    url: "https://www.unicef.org/nepal/online-safety-resources",
    logo: "/English.png.webp",
    className: "brightness-0 opacity-60", // Make it black and semi-transparent to match others
  },
  {
    name: "ICIMOD",
    tagline: "Protecting our mountains, securing our future",
    url: "https://www.icimod.org/",
    logo: "/ICIMOD-Vanijay.webp",
  },
  {
    name: "CWIN Nepal",
    tagline: "Every child deserves a childhood",
    url: "https://cwin.org.np/",
    logo: "/CWIN-Nepal-Vanijay.webp",
  },
];

const contactDepartments = [
  {
    email: "hello@vanijay.com",
    label: "Support",
    purposes: ["Support", "Orders", "Returns", "Refunds", "General queries", "Order tracking", "Complaints", "After-sales support"],
  },
  {
    email: "business@vanijay.com",
    label: "Sales",
    purposes: ["Sales", "Product inquiries", "Bulk purchase", "Wholesale inquiries"],
  },
  {
    email: "money@vanijay.com",
    label: "Accounts",
    purposes: ["Accounts", "Finance", "Billing", "Payment reconciliation", "Vendor invoices"],
  },
  {
    email: "ops@vanijay.com",
    label: "Admin",
    purposes: ["System notifications", "Platform emails", "Payment alerts", "Hosting / domain", "Social logins"],
  },
];

const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground pt-8 pb-6 border-t border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Vanijay</h3>
            <div className="flex items-center gap-4 pt-2">
              <Link href="https://www.facebook.com/VanijayEnterprises" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Facebook className="w-5 h-5" /></Link>
              <Link href="https://www.instagram.com/vanijay_enterprises" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Instagram className="w-5 h-5" /></Link>
              <Link href="https://x.com/Vanijay_Ent" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Twitter className="w-5 h-5" /></Link>
              <Link href="https://www.tiktok.com/@vanijay_enterprises" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Music4 className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Company Column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div className="pt-2 border-t border-border/30">
              <h4 className="text-sm font-semibold text-foreground mb-1">Sales</h4>
              <a href="mailto:business@vanijay.com" className="text-xs text-primary font-medium hover:underline block mb-2">business@vanijay.com</a>
              <p className="text-[10px] leading-tight opacity-70">Sales, Product inquiries, Bulk purchase, Wholesale inquiries</p>
            </div>
          </div>

          {/* Support Column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/returns-policy" className="hover:text-primary transition-colors">Cancellation & Returns</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Info</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div className="pt-2 border-t border-border/30">
              <h4 className="text-sm font-semibold text-foreground mb-1">Support</h4>
              <a href="mailto:hello@vanijay.com" className="text-xs text-primary font-medium hover:underline block mb-2">hello@vanijay.com</a>
              <p className="text-[10px] leading-tight opacity-70">Orders, Returns, Refunds, General queries, Tracking, After-sales</p>
            </div>
          </div>

          {/* Legal/Admin Column */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            <div className="pt-2 border-t border-border/30 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[11px] font-semibold text-foreground mb-1">Accounts</h4>
                <a href="mailto:money@vanijay.com" className="text-[10px] text-primary font-medium hover:underline block">money@vanijay.com</a>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-foreground mb-1">Admin</h4>
                <a href="mailto:ops@vanijay.com" className="text-[10px] text-primary font-medium hover:underline block">ops@vanijay.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Initiatives Section */}
        <div className="border-t border-border/50 py-8 mb-6">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100">
            {initiatives.map((item, index) => (
              <Link
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
                title={`${item.name}: ${item.tagline}`}
              >
                <div className="relative h-12 w-32">
                  <Image
                    src={item.logo}
                    alt={item.name}
                    fill
                    className={`object-contain ${item.className || ""}`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Vanijay. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/site-map" className="hover:text-primary cursor-pointer">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
