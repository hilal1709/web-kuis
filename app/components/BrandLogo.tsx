import Image from "next/image";
import Link from "next/link";
import brandLogo from "@/public/logo-cropped.png";

type BrandLogoProps = {
  href?: string;
  width?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  width = 140,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const height = Math.round((width * brandLogo.height) / brandLogo.width);

  return (
    <Link href={href} aria-label="XSATU" className={className}>
      <Image
        src={brandLogo}
        alt="XSATU"
        width={width}
        height={height}
        priority={priority}
      />
    </Link>
  );
}
