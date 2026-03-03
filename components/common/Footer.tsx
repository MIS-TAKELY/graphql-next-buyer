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
    <footer className="bg-muted text-muted-foreground pt-20 pb-10 border-t border-border/60">
      <div className="container-custom">
        {/* Brand & Socials - Top Row Wide */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 pb-16 border-b border-border/40">
          <div className="space-y-4">
            <h3 className="font-bold text-3xl tracking-tight text-foreground">Vanijay</h3>
            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">
              Connecting you to quality products with trust and efficiency. Your premier destination for seamless commerce.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="https://www.facebook.com/VanijayEnterprises" className="hover:text-primary transition-all hover:-translate-y-1 duration-300"><Facebook className="w-6 h-6" /></Link>
            <Link href="https://www.instagram.com/vanijay_enterprises" className="hover:text-primary transition-all hover:-translate-y-1 duration-300"><Instagram className="w-6 h-6" /></Link>
            <Link href="https://x.com/Vanijay_Ent" className="hover:text-primary transition-all hover:-translate-y-1 duration-300"><Twitter className="w-6 h-6" /></Link>
            <Link href="https://www.tiktok.com/@vanijay_enterprises" className="hover:text-primary transition-all hover:-translate-y-1 duration-300"><Music4 className="w-6 h-6" /></Link>
          </div>
        </div>

        {/* Contact Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 mb-20">
          {contactDepartments.map((dept, idx) => (
            <div key={idx} className="space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary/80 block">
                  {dept.label}
                </span>
                <a
                  href={`mailto:${dept.email}`}
                  className="group flex items-center gap-2 text-foreground font-semibold text-base hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {dept.email}
                </a>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/40 mb-3">For</h4>
                <ul className="space-y-2">
                  {dept.purposes.map((purpose, pIdx) => (
                    <li key={pIdx} className="text-[13px] text-muted-foreground/70 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-border" />
                      {purpose}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-12 border-t border-border/40 mb-12">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-foreground/70 mb-6">Company</h3>
            <ul className="space-y-4 text-[15px]">
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2 group">About Us <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors flex items-center gap-2 group">Careers <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-foreground/70 mb-6">Customer Care</h3>
            <ul className="space-y-4 text-[15px]">
              <li><Link href="/returns-policy" className="hover:text-primary transition-colors flex items-center gap-2 group">Returns & Refunds <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary transition-colors flex items-center gap-2 group">Shipping Info <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2 group">Contact Support <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xs uppercase tracking-widest font-bold text-foreground/70 mb-6">Policies</h3>
            <ul className="space-y-4 text-[15px] flex flex-wrap md:flex-col gap-x-8 gap-y-4">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Initiatives Section */}
        <div className="border-t border-border/40 py-12 mb-10">
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
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
