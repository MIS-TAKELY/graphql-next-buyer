import { Facebook, Instagram, Twitter, Linkedin, Music4, Mail, ArrowRight } from "lucide-react";
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
    purposes: [
      "Support", "Orders", "Returns", "Refunds",
      "General customer queries", "Order tracking",
      "Returns & exchanges", "Complaints",
      "Product questions", "After-sales support"
    ],
  },
  {
    email: "business@vanijay.com",
    label: "Sales",
    purposes: [
      "Sales", "Product inquiries",
      "Bulk purchase requests", "Wholesale inquiries"
    ],
  },
  {
    email: "money@vanijay.com",
    label: "Accounts",
    purposes: [
      "Accounts", "Finance", "Billing",
      "Payment reconciliation", "Vendor invoices"
    ],
  },
  {
    email: "ops@vanijay.com",
    label: "Admin",
    purposes: [
      "System notifications", "Platform emails",
      "Payment gateway alerts", "Hosting / domain notices",
      "Google / Meta / marketplace logins"
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground pt-16 pb-8 border-t border-border/60">
      <div className="container-custom">
        {/* Optimized Single Row Layout with Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-x-6 gap-y-10 mb-10 pb-10 border-b border-border/40 items-start">

          {/* Col 1: Brand & Initiatives */}
          <div className="xl:col-span-1 space-y-5">
            <div>
              <h3 className="font-bold text-2xl tracking-tighter text-foreground mb-1">Vanijay</h3>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-primary/60">
                Premium Commerce
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {initiatives.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                  title={`${item.name}: ${item.tagline}`}
                >
                  <div className="relative h-5 w-14">
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

            <div className="flex items-center gap-3 pt-2">
              <Link href="https://www.facebook.com/VanijayEnterprises" className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Facebook className="w-3 h-3" /></Link>
              <Link href="https://www.instagram.com/vanijay_enterprises" className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Instagram className="w-3 h-3" /></Link>
              <Link href="https://x.com/Vanijay_Ent" className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Twitter className="w-3 h-3" /></Link>
              <Link href="https://www.tiktok.com/@vanijay_enterprises" className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Music4 className="w-3 h-3" /></Link>
            </div>
          </div>

          {/* Col 2: Navigation Links (Grouped) */}
          <div className="xl:col-span-1 grid grid-cols-1 gap-y-8">
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 border-l border-primary/30 pl-2">Company</h3>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/about" className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-200">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-200">Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 border-l border-primary/30 pl-2">Care</h3>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/returns-policy" className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-200">Returns & Refunds</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-200">Shipping Info</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-200">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-8">
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 border-l border-primary/30 pl-2">Legal</h3>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-200">Privacy Policy</Link></li>
                <li><Link href="/terms-conditions" className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-200">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Cols 4-7: Detailed Contact Departments */}
          {contactDepartments.map((dept, idx) => (
            <div key={idx} className="xl:col-span-1 space-y-4">
              <div className="space-y-1.5 ">
                <span className="text-[9px] uppercase tracking-widest font-bold text-primary">
                  {dept.label}
                </span>
                <a
                  href={`mailto:${dept.email}`}
                  className="text-foreground font-bold text-[12px] hover:text-primary transition-colors truncate block"
                >
                  {dept.email}
                </a>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] uppercase tracking-tighter font-black text-muted-foreground/30">FOR</span>
                  <div className="h-px bg-border/20 flex-1" />
                </div>
                <ul className="space-y-1">
                  {dept.purposes.map((purpose, pIdx) => (
                    <li key={pIdx} className="text-[10px] text-muted-foreground/70 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary/30 mt-1 shrink-0" />
                      <span>{purpose}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] opacity-60">
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
