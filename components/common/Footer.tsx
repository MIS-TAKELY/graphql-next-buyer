import { Facebook, Instagram, Linkedin, Music4, Mail, ArrowRight } from "lucide-react";
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
      "Orders", "Tracking", "Returns & Refund",
      "Complaints", "Product questions", "After-sales"
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
];

const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.403z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-muted/50 dark:bg-muted/20 text-muted-foreground pt-8 sm:pt-12 pb-6 sm:pb-8 border-t border-border/40">
      <div className="container-custom">
        {/* Main Row: Left (Brand+Nav+NGOs+Socials) | Right (Emails) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 sm:gap-y-10 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border/20 items-start">

          {/* LEFT SECTION: Brand + Nav | NGOs | Socials */}
          <div className="space-y-6 lg:col-span-5">
            {/* Row 1: Brand and Nav Links side-by-side */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

              {/* Nav Links */}
              <div className="xl:col-span-12 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-foreground/70 dark:text-foreground/80">Company</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-[11px] font-medium">
                    <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                    <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                  </ul>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-foreground/70 dark:text-foreground/80">Support</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-[11px] font-medium">
                    <li><Link href="/returns-policy" className="hover:text-primary transition-colors">Returns &amp; Refunds</Link></li>
                    <li><Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Info</Link></li>
                  </ul>
                </div>
                <div className="space-y-3 sm:space-y-4 col-span-2 sm:col-span-1">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-foreground/70 dark:text-foreground/80">Legal</h4>
                  <ul className="space-y-1.5 sm:space-y-1 text-[11px] font-medium flex sm:block gap-x-4">
                    <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* NGO Logos & Socials Stacked */}
            <div className="flex flex-col gap-6 sm:gap-8 pt-2">
              {/* NGO Logos */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-4 grayscale opacity-40 dark:opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 pb-2">
                {initiatives.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-105"
                    title={`${item.name}: ${item.tagline}`}
                  >
                    <div className="relative h-6 w-20 sm:h-8 sm:w-24">
                      <Image src={item.logo} alt={item.name} fill className={`object-contain ${item.className || ""}`} />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Socials */}
              <div className="flex flex-col items-center gap-4">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">Social</h4>
                <div className="flex items-center justify-center gap-4">
                  <Link href="https://www.facebook.com/VanijayEnterprises" className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Facebook className="w-3.5 h-3.5" /></Link>
                  <Link href="https://www.instagram.com/vanijay_enterprises" className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><Instagram className="w-3.5 h-3.5" /></Link>
                  <Link href="https://x.com/Vanijay_Ent" className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><XIcon className="w-3.5 h-3.5" /></Link>
                  <Link href="https://www.tiktok.com/@vanijay_enterprises" className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"><TikTokIcon className="w-3.5 h-3.5" /></Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: 3 Email Contact Columns */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-7">
            <Link href="/contact" className="inline-block group">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-foreground/70 dark:text-foreground/80 group-hover:text-primary transition-colors">Contact</h4>
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6 sm:gap-y-8">
              {/* Email Contact Cols */}
              {contactDepartments.map((dept, idx) => (
                <div key={idx} className="space-y-3">
                  <a href={`mailto:${dept.email}`} className="text-foreground dark:text-foreground/90 text-[13px] hover:text-primary transition-colors break-all block font-medium">
                    {dept.email}
                  </a>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] uppercase tracking-tighter font-black text-muted-foreground/30 dark:text-muted-foreground/40">FOR</span>
                      <div className="h-px bg-border/20 dark:bg-border/10 flex-1" />
                    </div>
                    <ul className="space-y-1">
                      {dept.purposes.map((purpose, pIdx) => (
                        <li key={pIdx} className="text-[10px] text-muted-foreground/70 dark:text-muted-foreground/60 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-primary/30 dark:bg-primary/40 mt-1 shrink-0" />
                          <span>{purpose}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Bottom Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] opacity-60">
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
