import { cn } from "@/lib/utils";
import { ImgHTMLAttributes } from "react";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  size?: number | string;
  className?: string;
}

export function Image({
  src,
  alt = "",
  size,
  className,
  style,
  ...props
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("inline-block", className)}
      style={size ? { width: size, height: size, ...style } : style}
      draggable={false}
      {...props}
    />
  );
}
