import { createClient } from '../../lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Retrieve base domain from environment, fallback to standard domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hydrowells.com';

  // 1. Fetch active services
  const { data: services } = await supabase
    .from('services')
    .select('slug, updated_at')
    .eq('active', true);

  // 2. Fetch active projects
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, updated_at')
    .eq('active', true);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Append services
  services?.forEach((service) => {
    const lastmod = service.updated_at
      ? new Date(service.updated_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    xml += `
  <url>
    <loc>${baseUrl}/services/${service.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Append projects
  projects?.forEach((project) => {
    const lastmod = project.updated_at
      ? new Date(project.updated_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    xml += `
  <url>
    <loc>${baseUrl}/projects/${project.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=18000',
    },
  });
}
