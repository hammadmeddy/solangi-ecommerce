export const ADMIN_MEDIA_KEY = "solangi-admin-media";

export type AdminMediaState = {
  categoryImages: Record<string, string>;
  productImages: Record<string, string>;
  /** Override hero slide images by index 0..2 */
  heroImages: Record<string, string>;
  announcement: string;
};

export const emptyAdminMedia = (): AdminMediaState => ({
  categoryImages: {},
  productImages: {},
  heroImages: {},
  announcement: "",
});

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}
