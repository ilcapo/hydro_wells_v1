import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { Star, MapPin, ShieldCheck, ChevronRight, Waves, Calendar, FileVideo, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReviewForm from '../../../components/ReviewForm';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from('services')
    .select('name, meta_title, meta_description, short_description, featured_image')
    .eq('slug', slug)
    .single();

  if (!service) {
    return {
      title: 'Service Not Found | HydroWells',
    };
  }

  const title = service.meta_title || `${service.name} | HydroWells Maryland & DC`;
  const description = service.meta_description || service.short_description || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: service.featured_image ? [{ url: service.featured_image }] : [],
      type: 'website',
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch service details with category name
  const { data: service } = await supabase
    .from('services')
    .select(`
      *,
      service_categories ( name, description )
    `)
    .eq('slug', slug)
    .single();

  // Check if service exists and is active
  if (!service || !service.active) {
    notFound();
  }

  // 2. Fetch gallery images
  const { data: gallery } = await supabase
    .from('service_images')
    .select('*')
    .eq('service_id', service.id)
    .order('sort_order', { ascending: true });

  // 3. Fetch approved reviews for this service
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      review_media ( id, file_url, file_type )
    `)
    .eq('service_id', service.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.name,
    'description': service.short_description,
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'HydroWells',
      'image': service.featured_image || 'https://hydrowells.com/logo.png',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '22910 Mount Ephraim Rd',
        'addressLocality': 'Dickerson',
        'addressRegion': 'MD',
        'postalCode': '20842',
        'addressCountry': 'US',
      },
      'telephone': '301-393-7090',
      'priceRange': '$$',
    },
    'areaServed': ['Maryland', 'Washington DC'],
  };

  return (
    <main className="min-h-screen pb-24 pt-10 px-6 sm:px-8 lg:px-10">
      {/* Schema.org Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Navigation Breadcrumb & Back */}
        <div className="mb-8 flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/#services" className="hover:text-primary transition">Services</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white truncate">{service.name}</span>
          </div>
          <Link href="/#services" className="hover:text-white flex items-center gap-1 transition">
            ← Back
          </Link>
        </div>

        {/* Hero Area */}
        <section className="relative rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 md:p-12 shadow-panel backdrop-blur-xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-hero-glow opacity-80 pointer-events-none" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              {service.service_categories && (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  {service.service_categories.name}
                </span>
              )}
              <h1 className="mt-5 text-4xl sm:text-5xl font-display font-bold text-white tracking-tight drop-shadow-[0_0_20px_rgba(0,194,255,0.15)]">
                {service.name}
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
                {service.short_description}
              </p>
            </div>

            {/* Banner Photo */}
            <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-glow">
              {service.featured_image ? (
                <Image
                  src={service.featured_image}
                  alt={service.name}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-600">
                  <Waves className="h-12 w-12 opacity-50 animate-pulse text-primary mb-3" />
                  <span className="text-sm">HydroWells Professional Water Solutions</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Two-Column Detail Layout */}
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main detailed text */}
          <div className="lg:col-span-2 space-y-10">
            {/* Long Description Card */}
            <div className="rounded-[2.2rem] border border-white/10 bg-slate-950/40 p-8 md:p-10 shadow-panel backdrop-blur-xl space-y-6">
              <h2 className="text-2xl font-semibold text-white font-display">Information and Details</h2>
              <div className="text-slate-300 space-y-4 leading-relaxed text-base whitespace-pre-line">
                {service.full_description}
              </div>
            </div>

            {/* Gallery Section */}
            {gallery && gallery.length > 0 && (
              <div className="rounded-[2.2rem] border border-white/10 bg-slate-950/40 p-8 md:p-10 shadow-panel backdrop-blur-xl space-y-6">
                <h2 className="text-2xl font-semibold text-white font-display">Image Gallery</h2>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                  {gallery.map((img) => (
                    <div
                      key={img.id}
                      className="group relative h-32 sm:h-40 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-panel"
                    >
                      <Image
                        src={img.image_url}
                        alt={img.caption || service.name}
                        fill
                        sizes="(max-w-768px) 50vw, 30vw"
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
              </div>
            )}

            {/* Testimonials List */}
            <div className="rounded-[2.2rem] border border-white/10 bg-slate-950/40 p-8 md:p-10 shadow-panel backdrop-blur-xl space-y-6">
              <h2 className="text-2xl font-semibold text-white font-display">Customer Reviews</h2>
              
              {!reviews || reviews.length === 0 ? (
                <p className="text-slate-500 text-sm italic">There are no reviews for this service yet. Be the first to leave a review!</p>
              ) : (
                <div className="space-y-6 divide-y divide-white/5">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-6 first:pt-0 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{rev.name}</p>
                          <div className="flex items-center gap-0.5 text-yellow-500 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(rev.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 italic leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                      
                      {/* Attached review media */}
                      {rev.review_media && rev.review_media.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {rev.review_media.map((media: any) => (
                            <div
                              key={media.id}
                              className="group relative h-20 w-32 rounded-lg overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center shrink-0"
                            >
                              {media.file_type.startsWith('image') || media.file_type === 'image' ? (
                                <>
                                  <Image src={media.file_url} alt="Review evidence" fill className="object-cover" />
                                  <a
                                    href={media.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-semibold gap-1 transition-opacity"
                                  >
                                    <ExternalLink className="h-3 w-3" /> View Photo
                                  </a>
                                </>
                              ) : (
                                <div className="p-2 text-center w-full h-full flex flex-col justify-center items-center gap-1">
                                  <FileVideo className="h-5 w-5 text-sky-400 animate-pulse" />
                                  <a
                                    href={media.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[8px] text-sky-300 hover:underline flex items-center gap-0.5"
                                  >
                                    Play Video <ExternalLink className="h-2 w-2" />
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Sidebar quick info card */}
            <div className="rounded-[2.2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl space-y-6">
              <h3 className="text-xl font-semibold text-white font-display">HydroWells Guarantee</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Satisfaction Guarantee</h4>
                    <p className="text-xs text-slate-400 mt-1">All our works come with a signed quality guarantee.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Maryland & Washington DC</h4>
                    <p className="text-xs text-slate-400 mt-1">Fast support across the entire local metropolitan area.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Call for Emergencies</p>
                <a href="tel:3013937090" className="inline-block mt-2 text-2xl font-bold text-primary hover:text-sky-300 transition">
                  301-393-7090
                </a>
              </div>
            </div>

            {/* Embedded Form Component */}
            <ReviewForm serviceId={service.id} serviceName={service.name} />
          </div>
        </div>
      </div>
    </main>
  );
}
