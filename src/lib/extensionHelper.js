// Shared helper: derive a safe storage-path extension from a File's MIME
// type rather than trusting the filename the user (or their OS) provided.
// file.name.split(".").pop() trusts attacker-controlled input directly
// into a storage key — a crafted filename could inject unexpected path
// segments. Whitelisting against file.type closes that off.
const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export function safeImageExtension(file) {
  return MIME_TO_EXT[file.type] ?? "jpg";
}
