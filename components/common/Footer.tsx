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
    <footer className="bg-muted text-muted-foreground pt-24 pb-12 border-t border-border/60">
      <div className="container-custom">
        {/* Row 1: Brand, Navigation, and Socials - Perfectly Balanced First Line */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 mb-20 pb-16 border-b border-border/40 items-start">
          <div className="md:col-span-1 lg:col-span-2 space-y-8">
            <div>
              <h3 className="font-bold text-4xl tracking-tighter text-foreground mb-2">Vanijay</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
                Premium Commerce
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/40">In Partnership with</span>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {initiatives.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    title={`${item.name}: ${item.tagline}`}
                  >
                    <div className="relative h-6 w-16">
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
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-foreground/40 border-l border-primary/30 pl-3">Company</h3>
            <ul className="space-y-3 text-[14px]">
              <li><Link href="/about" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Careers</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-foreground/40 border-l border-primary/30 pl-3">Customer Care</h3>
            <ul className="space-y-3 text-[14px]">
              <li><Link href="/returns-policy" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Returns & Refunds</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Shipping Info</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-foreground/40 border-l border-primary/30 pl-3">Legal</h3>
            <ul className="space-y-3 text-[14px]">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="flex items-center gap-5 lg:justify-end pt-1">
            <Link href="https://www.facebook.com/VanijayEnterprises" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Facebook className="w-4 h-4" /></Link>
            <Link href="https://www.instagram.com/vanijay_enterprises" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Instagram className="w-4 h-4" /></Link>
            <Link href="https://x.com/Vanijay_Ent" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Twitter className="w-4 h-4" /></Link>
            <Link href="https://www.tiktok.com/@vanijay_enterprises" className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Music4 className="w-4 h-4" /></Link>
          </div>
        </div>

        {/* Row 2: Department Details - Optimized for White Space and Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-20 mb-24">
          {contactDepartments.map((dept, idx) => (
            <div key={idx} className="space-y-8 group">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary block transition-colors group-hover:text-foreground">
                  {dept.label}
                </span>
                <a
                  href={`mailto:${dept.email}`}
                  className="flex items-center gap-3 text-foreground font-bold text-[17px] hover:text-primary transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  {dept.email}
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/30">FOR</span>
                  <div className="h-px bg-border/40 flex-1" />
                </div>
                <ul className={`grid gap-x-6 gap-y-3 ${dept.label === "Support" ? "grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
                  {dept.purposes.map((purpose, pIdx) => (
                    <li key={pIdx} className="text-[13px] text-muted-foreground/80 flex items-start gap-2.5 group/item cursor-default">
                      <span className="w-1.5 h-1.5 rounded-full border border-primary/40 mt-1.5 shrink-0 group-hover/item:bg-primary transition-colors" />
                      <span className="group-hover/item:text-foreground transition-colors">{purpose}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
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
