import { createClient } from '../lib/supabase/server';
import HomeClient from './HomeClient';

export const revalidate = 60; // Revalidate at most every 60 seconds (ISR)

export default async function HomePage() {
  const supabase = await createClient();
  let services: any[] = [];
  let projects: any[] = [];
  let reviews: any[] = [];

  try {
    // Fetch active services
    const { data: srvs } = await supabase
      .from('services')
      .select('id, name, slug, short_description')
      .eq('active', true);
    if (srvs) services = srvs;

    // Fetch active projects
    const { data: prjs } = await supabase
      .from('projects')
      .select('id, title, slug, description, location, completion_date, featured_image')
      .eq('active', true)
      .limit(3);
    if (prjs) projects = prjs;

    // Fetch approved reviews
    const { data: revs } = await supabase
      .from('reviews')
      .select('name, comment, rating')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(4);
    if (revs) reviews = revs;
  } catch (err) {
    console.error('Error fetching landing data on server:', err);
  }

  return (
    <HomeClient
      initialServices={services}
      initialProjects={projects}
      initialReviews={reviews}
    />
  );
}
