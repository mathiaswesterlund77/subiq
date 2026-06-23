import Image from "next/image";

type LogoProps = {
  className?: string;
  variant?: "black" | "white";
  alt?: string;
  priority?: boolean;
  height?: number;
};

const ASPECT_RATIO = 1000 / 208;

export function Logo({
  className,
  variant = "white",
  alt = "SUBIQ",
  priority = false,
  height,
}: LogoProps) {
  const src =
    variant === "black" ? "/subiq-logo-black.png" : "/subiq-logo-white.png";
  const intrinsicHeight = height ?? 22;
  const intrinsicWidth = Math.round(intrinsicHeight * ASPECT_RATIO);

  return (
    <Image
      src={src}
      alt={alt}
      width={intrinsicWidth}
      height={intrinsicHeight}
      priority={priority}
      className={className}
      style={
        height !== undefined
          ? { height: `${height}px`, width: "auto" }
          : undefined
      }
      unoptimized
    />
  );
}
