import Image from "next/image";

const SIZES = {
  sm: { box: "h-24 w-24", dim: 96, text: "text-3xl" },
  md: { box: "h-28 w-28", dim: 112, text: "text-3xl" },
  lg: { box: "aspect-[4/5] w-full border border-sage/15", dim: null, text: "text-6xl tracking-wide lg:text-7xl" },
} as const;

/**
 * Uzman adının kelimelerinin baş harflerinden (en fazla 2) büyük harf monogram
 * üretir. Ör. "Melek Yıldız" -> "MY", "Sacide Şahin" -> "SŞ".
 */
function monogram(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr"))
    .join("");
}

/**
 * Uzman fotoğrafı: panelden görsel girildiyse portre, yoksa monogram
 * yer tutucusu. Team.tsx (homepage), /ekip listesi ve /ekip/[slug] detay
 * sayfasında ortak kullanılır — boyut/oran farkı `size` ile ayarlanır,
 * konumlandırma (margin/centering) çağıran tarafın `className`'i ile.
 */
export default function ExpertAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}: {
  name: string;
  imageUrl: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { box, dim, text } = SIZES[size];
  const boxDim = dim ?? 288;
  const boxDimH = dim ?? 360;

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`${name} portresi`}
        width={boxDim}
        height={boxDimH}
        className={`${box} rounded-2xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex ${box} items-center justify-center rounded-2xl bg-sage/10 ${className}`}
    >
      <span className={`font-display ${text} font-light text-sage`}>
        {monogram(name)}
      </span>
    </div>
  );
}
