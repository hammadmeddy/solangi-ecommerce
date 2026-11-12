/**
 * Curated stock photos for category / product cards when no admin upload exists.
 * Unsplash hotlinks — replace anytime via Admin → Catalog photos.
 */
export const CATEGORY_PHOTOS: Record<string, string> = {
  computers:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&h=800&q=80",
  fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&h=800&q=80",
  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&h=800&q=80",
  home:
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&h=800&q=80",
  grocery:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&h=800&q=80",
  beauty:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&h=800&q=80",
  health:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&h=800&q=80",
  baby:
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&h=800&q=80",
  sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=800&h=800&q=80",
  auto:
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&h=800&q=80",
  agri:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3859?auto=format&fit=crop&w=800&h=800&q=80",
  industrial:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=800&q=80",
  construction:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&h=800&q=80",
  books:
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&h=800&q=80",
  furniture:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&h=800&q=80",
  toys:
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&h=800&q=80",
  jewellery:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&h=800&q=80",
  services:
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&h=800&q=80",
};

export function categoryPhoto(categoryId: string): string | undefined {
  return CATEGORY_PHOTOS[categoryId];
}
