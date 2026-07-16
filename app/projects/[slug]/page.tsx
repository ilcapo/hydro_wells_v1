import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { ChevronRight, MapPin, Calendar, Image as ImageIcon, Waves, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

// Generate Dynamic SEO Metadata for Project
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('projects')
    .select('title, description, featured_image')
    .eq('slug', slug)
    .single();

  if (!project) {
    return {
      title: 'Project Not Found | HydroWells',
    };
  }

  const title = `${project.title} | HydroWells Maryland`;
  const description = project.description || `Technical details and real photos of the project completed by HydroWells.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: project.featured_image ? [{ url: project.featured_image }] : [],
      type: 'website',
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch project details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  // Check if project exists and is active
  if (!project || !project.active) {
    notFound();
  }

  // Fetch project images
  const { data: gallery } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  // Schema.org JSON-LD for CreativeWork/Project
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': project.title,
    'description': project.description,
    'image': project.featured_image || 'https://hydrowells.com/logo.png',
    'locationCreated': {
      '@type': 'Place',
      'name': project.location || 'Maryland & DC',
    },
    'dateCreated': project.completion_date,
    'author': {
      '@type': 'Organization',
      'name': 'HydroWells',
    },
  };

  return (
    <main className="min-h-screen pb-24 pt-10 px-6 sm:px-8 lg:px-10">
      {/* Schema.org Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Projects</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white truncate">{project.title}</span>
          </div>
          <Link href="/" className="hover:text-white flex items-center gap-1 transition">
            ← Home
          </Link>
        </div>

        {/* Hero Section */}
        <section className="relative rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 md:p-12 shadow-panel backdrop-blur-xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-hero-glow opacity-80 pointer-events-none" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1.5 text-xs font-semibold text-sky-300 uppercase tracking-wider font-mono">
                Success Case
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight drop-shadow-[0_0_20px_rgba(0,194,255,0.15)]">
                {project.title}
              </h1>

              {/* Metadata Info */}
              <div className="flex flex-wrap gap-4 pt-2">
                {project.location && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{project.location}</span>
                  </div>
                )}
                {project.completion_date && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-full">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      Completed:{' '}
                      {new Date(project.completion_date).toLocaleDateString('en-US', {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-glow">
              {project.featured_image ? (
                <Image
                  src={project.featured_image}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-600">
                  <Waves className="h-12 w-12 opacity-50 text-primary mb-3" />
                  <span className="text-sm">HydroWells Completed Project</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Details & Description */}
        <section className="grid gap-8 md:grid-cols-3">
          {/* Detailed Text */}
          <div className="md:col-span-2 rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 md:p-10 shadow-panel backdrop-blur-xl space-y-6">
            <h2 className="text-2xl font-semibold text-white font-display">Summary and Technical Challenge</h2>
            <div className="text-slate-300 space-y-4 leading-relaxed text-base whitespace-pre-line">
              {project.description}
            </div>
          </div>

          {/* Quick Metrics sidebar */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl flex flex-col justify-between space-y-6 h-fit">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Project Guarantee</h3>
              <div className="space-y-4 text-slate-300 text-xs leading-relaxed">
                <div className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>High-resistance drilling and piping with proven durability.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Post-work site cleanup to preserve the aesthetic of your yard.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Exhaustive flow testing and primary water quality analysis.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 text-center">
              <Link
                href="/#contact"
                className="w-full inline-block py-3 rounded-xl bg-gradient-to-r from-primary to-primaryDark text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(0,194,255,0.1)] hover:shadow-[0_0_20px_rgba(0,194,255,0.2)] active:scale-95 transition-all duration-200"
              >
                Request similar quote
              </Link>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        {gallery && gallery.length > 0 && (
          <section className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 md:p-10 shadow-panel backdrop-blur-xl space-y-6">
            <h2 className="text-2xl font-semibold text-white font-display">Project Gallery / Evidence</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="group relative h-32 sm:h-36 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-panel"
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption || project.title}
                    fill
                    sizes="(max-w-768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-2 text-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[10px] text-slate-300 truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
