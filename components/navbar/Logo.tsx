import Image from "next/image";
import Link from "next/link";

const Logo = () => (
  <div className="flex-shrink-0">
    <Link href="/" passHref>
      <Image
        src="/final_blue_text_500by500.svg"
        alt="Logo"
        width={90}
        height={90}
        className="filter hover:cursor-pointer"
        priority
      />
    </Link>
  </div>
);

export default Logo;
