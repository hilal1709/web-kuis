// Next.js hanya mendeklarasikan tipe untuk ekstensi gambar huruf kecil (mis. *.png).
// File public menggunakan ekstensi huruf besar (logo.PNG), jadi tambahkan
// deklarasi modul agar import statis-nya dikenali TypeScript.
declare module "*.PNG" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}

declare module "*.JPG" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}

declare module "*.JPEG" {
  import type { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}
