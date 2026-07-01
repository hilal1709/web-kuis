import Image from "next/image";
import Link from "next/link";

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
  const height = Math.round((width * 120) / 360);

  return (
    <Link href={href} aria-label="XSATU" className={className}>
      <Image
        src="/xsatu-logo.svg"
        alt="XSATU"
        width={width}
        height={height}
        priority={priority}
      />
    </Link>
  );
}
