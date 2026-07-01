import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="w-full py-12 px-margin md:px-gutter mt-auto flex flex-col md:flex-row justify-between items-center gap-6 bg-on-background border-t-4 border-on-background">
      <div className="flex flex-col items-center md:items-start gap-2">
        <BrandLogo href="/" width={144} />
        <p className="font-body-md text-surface-variant">
          © 2024 XSATU
        </p>
      </div>
      <div className="flex gap-8">
        {["Privacy", "Terms", "Help", "Careers"].map((l) => (
          <a
            key={l}
            className="text-surface-variant hover:text-tertiary-fixed-dim transition-colors font-body-md"
            href="#"
          >
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}
