export const getAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Remove leading slash if present to avoid double slashes when joining
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // import.meta.env.BASE_URL is '/' in dev and '/traveler/' in prod (if configured)
  // It usually ends with a slash.
  const baseUrl = import.meta.env.BASE_URL;

  return `${baseUrl}${cleanPath}`;
};
