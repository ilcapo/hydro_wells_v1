import { createClient } from '../../lib/supabase/server';
import GalleryClient from './GalleryClient';

export const revalidate = 60; // ISR - revalidate every 60 seconds

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: 'Services' | 'Projects' | 'Client Evidences';
  originName: string;
  originUrl?: string;
}

const fallbackImages: GalleryItem[] = [
  {
    id: 'fallback-1',
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=1200&auto=format&fit=crop',
    caption: 'Professional drilling rig operating on site.',
    category: 'Services',
    originName: 'Water Well Drilling',
    originUrl: '/water-well-drilling'
  },
  {
    id: 'fallback-2',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
    caption: 'Modern submersible pump installation.',
    category: 'Services',
    originName: 'Pump Service',
    originUrl: '/pump-service'
  },
  {
    id: 'fallback-3',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    caption: 'High-performance constant pressure controller setup.',
    category: 'Services',
    originName: 'Constant Pressure',
    originUrl: '/constant-pressure'
  },
  {
    id: 'fallback-4',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop',
    caption: 'Complete residential well drilling project in Maryland.',
    category: 'Projects',
    originName: 'Maryland Residential Well'
  },
  {
    id: 'fallback-5',
    url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=1200&auto=format&fit=crop',
    caption: 'Commercial water pressure system upgrade.',
    category: 'Projects',
    originName: 'Commercial System Upgrade'
  },
  {
    id: 'fallback-6',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    caption: 'Clean, safe water system delivery and final inspection.',
    category: 'Client Evidences',
    originName: 'Review by Jerico Sequera'
  }
];

export default async function GalleryPage() {
  const supabase = await createClient();
  let dbImages: GalleryItem[] = [];

  try {
    // 1. Fetch service images
    const { data: sImages } = await supabase
      .from('service_images')
      .select('image_url, caption, services!inner(name, slug, active)')
      .eq('services.active', true);

    const serviceItems = (sImages || []).map((img: any, idx: number) => ({
      id: `service-${idx}-${img.image_url}`,
      url: img.image_url,
      caption: img.caption || img.services?.name || 'Service Image',
      category: 'Services' as const,
      originName: img.services?.name || '',
      originUrl: `/services/${img.services?.slug}`
    }));

    // 2. Fetch project images
    const { data: pImages } = await supabase
      .from('project_images')
      .select('image_url, caption, projects!inner(title, slug, active)')
      .eq('projects.active', true);

    const projectItems = (pImages || []).map((img: any, idx: number) => ({
      id: `project-${idx}-${img.image_url}`,
      url: img.image_url,
      caption: img.caption || img.projects?.title || 'Project Image',
      category: 'Projects' as const,
      originName: img.projects?.title || '',
      originUrl: `/projects/${img.projects?.slug}`
    }));

    // 3. Fetch review media (approved reviews only, type image)
    const { data: rMedia } = await supabase
      .from('review_media')
      .select('file_url, file_type, reviews!inner(name, status)')
      .eq('reviews.status', 'approved')
      .eq('file_type', 'image');

    const reviewItems = (rMedia || []).map((media: any, idx: number) => ({
      id: `review-${idx}-${media.file_url}`,
      url: media.file_url,
      caption: `Shared by client: ${media.reviews?.name}`,
      category: 'Client Evidences' as const,
      originName: `Review by ${media.reviews?.name}`
    }));

    dbImages = [...serviceItems, ...projectItems, ...reviewItems];
  } catch (err) {
    console.error('Error fetching gallery data on server:', err);
  }

  // Combine fetched images and fallbacks if database returns empty
  const images = dbImages.length > 0 ? dbImages : fallbackImages;

  return <GalleryClient initialImages={images} />;
}
