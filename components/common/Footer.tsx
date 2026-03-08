import { Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const initiatives = [
  {
    name: "UNDP",
    tagline: "Youth leading Nepal's green future",
    url: "https://www.undp.org/nepal",
    logo: "/UNDP-Vanijay-1.webp",
  },
  {
    name: "U-Report",
    tagline: "Your voice, amplified",
    url: "https://nepal.ureport.in/",
    logo: "/U-Report_Logo_EN.png",
  },
  {
    name: "UNICEF",
    tagline: "Stay safe Online",
    url: "https://www.unicef.org/nepal/online-safety-resources",
    logo: "/unicef.webp",
    className: "invert dark:invert-0",
  },
  {
    name: "ICIMOD",
    tagline: "Protecting our mountains, securing our future",
    url: "https://www.icimod.org/",
    logo: "/ICIMOD-Vanijay.webp",
  },
  {
    name: "CWIN",
    tagline: "Every child deserves a childhood",
    url: "https://cwin.org.np/",
    logo: "/CWIN-Nepal-Vanijay.webp",
  },
];

const contactDepartments = [
  {
    email: "hello@vanijay.com",
    label: "Customer Support",
    // color: "text-sky-500 hover:text-sky-600",
  },
  {
    email: "business@vanijay.com",
    label: "Business Inquiries",
    // color: "text-purple-500 hover:text-purple-600",
  },
  {
    email: "money@vanijay.com",
    label: "Finance & Payments",
    // color: "text-emerald-500 hover:text-emerald-600",
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
    <footer className="bg-background dark:bg-muted/20 text-muted-foreground pt-12 sm:pt-16 pb-8 border-t border-border/40 font-sans mt-auto">
      <div className="container-custom">
        {/* Three Pillar Layout */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 mb-12 sm:mb-16 items-start">

          {/* Pillar 1: Logo & Tagline */}
          <div className="w-full lg:w-[20%] space-y-4">
            <Link href="/" className="flex items-center text-foreground w-fit block">
              <Image
                src="/final_blue_text_500by500.svg"
                alt="Vanijay"
                width={140}
                height={40}
                className="w-auto h-6 lg:h-7"
                priority
              />
            </Link>
            <p className="text-muted-foreground/80 text-[13px] leading-relaxed max-w-[240px]">
              An online shopping marketplace in Nepal, connecting verified sellers with customers nationwide. We provide a free platform offering the latest electronics, fashion, sports gear, and everyday essentials. We provide digital and cash payment options, timely delivery, and a top-choice e-commerce interface for Nepalese consumers.
            </p>
          </div>

          {/* Pillar 2: Links, Initiatives, and Social */}
          <div className="w-full lg:w-[60%] flex flex-col gap-12 lg:border-l lg:border-r lg:border-border/40 lg:px-8">
            {/* Row 1: Link Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* COMPANY */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-foreground/80 border-b border-border/40 pb-2">Company</h4>
                <ul className="space-y-3 text-[13px] font-medium text-muted-foreground/80">
                  <li><Link href="/about" className="hover:text-primary transition-colors block">About Us</Link></li>
                  <li><Link href="/careers" className="hover:text-primary transition-colors block">Careers</Link></li>
                </ul>
              </div>

              {/* SUPPORT */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-foreground/80 border-b border-border/40 pb-2">Support</h4>
                <ul className="space-y-3 text-[13px] font-medium text-muted-foreground/80">
                  <li><Link href="/returns-policy" className="hover:text-primary transition-colors block">Returns &amp; Refunds</Link></li>
                  <li><Link href="/shipping-policy" className="hover:text-primary transition-colors block">Shipping Info</Link></li>
                </ul>
              </div>

              {/* LEGAL */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-foreground/80 border-b border-border/40 pb-2">Legal</h4>
                <ul className="space-y-3 text-[13px] font-medium text-muted-foreground/80">
                  <li><Link href="/privacy-policy" className="hover:text-primary transition-colors block">Privacy Policy</Link></li>
                  <li><Link href="/terms-conditions" className="hover:text-primary transition-colors block">Terms of Service</Link></li>
                </ul>
              </div>
            </div>

            {/* Row 2: Supported Initiatives */}
            <div className="space-y-4 flex flex-col items-center">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-foreground/80">Supported Initiatives</h4>
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {initiatives.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${item.name}: ${item.tagline}`}
                    className="border border-border/60 hover:border-border p-1.5 rounded flex items-center justify-center min-h-[40px] bg-white/10 dark:bg-white text-[11px] text-muted-foreground/80 hover:text-foreground transition-all"
                  >
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={item.name}
                        width={100}
                        height={38}
                        className={`h-7 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 ${item.className || ""}`}
                      />
                    ) : (
                      <span className="uppercase tracking-wide font-bold px-1.5 dark:text-black">{item.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Row 3: Social */}
            <div className="space-y-4 flex flex-col items-center">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-foreground/80">Social</h4>
              <div className="flex items-center gap-3 justify-center">
                <Link href="https://www.facebook.com/VanijayEnterprises" className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <Facebook className="w-3.5 h-3.5" />
                </Link>
                <Link href="https://www.instagram.com/vanijay_enterprises" className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <Instagram className="w-3.5 h-3.5" />
                </Link>
                <Link href="https://x.com/Vanijay_Ent" className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <XIcon className="w-3.5 h-3.5" />
                </Link>
                <Link href="https://www.tiktok.com/@vanijay_enterprises" className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all duration-300">
                  <TikTokIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Pillar 3: Contact */}
          <div className="w-full lg:w-[20%] space-y-5">
            <h4 className="text-[11px] font-bold tracking-widest uppercase text-foreground/80 border-b border-border/40 pb-2">Contact</h4>
            <div className="flex flex-col gap-6 text-[13px]">
              {contactDepartments.map((dept, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground/60 text-[11px]">{dept.label}</span>
                  <a href={`mailto:${dept.email}`} className="font-medium transition-colors hover:text-primary">
                    {dept.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-muted-foreground/60 border-t border-border/30 pt-6">
          <p>&copy; {new Date().getFullYear()} Vanijay Enterprises . All rights reserved.</p>


        </div>
      </div>
    </footer>
  );
};

export default Footer;
