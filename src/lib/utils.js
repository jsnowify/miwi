import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function extractAvatarStoragePath(publicUrl) {
  if (!publicUrl) return null;
  const marker = "/avatars/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length).split("?")[0];
}

export function getInitial(name, handle) {
  const source = name || handle || "?";
  return source.charAt(0).toUpperCase();
}
