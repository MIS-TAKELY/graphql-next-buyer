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
    <footer className="bg-muted text-muted-foreground pt-12 md:pt-16 pb-8 border-t border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Vanijay</h3>
            <p className="text-sm max-w-xs leading-relaxed">
              Experience the best in e-commerce with our premium selection of products. Quality, trust, and speed delivered to your doorstep.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="https://www.facebook.com/VanijayEnterprises" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Facebook className="w-5 h-5" /></Link>
              <Link href="https://www.instagram.com/vanijay_enterprises" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Instagram className="w-5 h-5" /></Link>
              <Link href="https://x.com/Vanijay_Ent" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Twitter className="w-5 h-5" /></Link>
              <Link href="https://www.tiktok.com/@vanijay_enterprises" className="hover:text-primary transition-colors hover:scale-110 transform duration-200"><Music4 className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/returns-policy" className="hover:text-primary transition-colors">Cancellation & Returns</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact info grid */}
        <div className="border-t border-border/50 pt-10 mb-12">
          <h3 className="font-semibold text-foreground mb-6">Contact Us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactDepartments.map((dept, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {dept.label}
                </h4>
                <a
                  href={`mailto:${dept.email}`}
                  className="text-primary text-sm font-semibold hover:underline block"
                >
                  {dept.email}
                </a>
                <ul className="text-xs space-y-1 opacity-80">
                  {dept.purposes.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Initiatives Section */}
        <div className="border-t border-border/50 py-10 mb-8">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100">
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
