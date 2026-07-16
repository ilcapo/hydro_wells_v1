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

  // Schema.org Structured Data
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'HydroWells',
    'image': 'https://hydro-wells-v1-n5fe.vercel.app/hydro-wells-logo.png',
    'telephone': '301-393-7090',
    'email': 'hydrowells@gmail.com',
    'url': 'https://hydro-wells-v1-n5fe.vercel.app',
    'priceRange': '$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '22910 Mount Ephraim Rd',
      'addressLocality': 'Dickerson',
      'addressRegion': 'MD',
      'postalCode': '20842',
      'addressCountry': 'US',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 39.2215,
      'longitude': -77.4264,
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      'opens': '00:00',
      'closes': '23:59',
    },
    'knowsAbout': [
      'Water Well Drilling',
      'Well Pump Repair',
      'Submersible Pump Service',
      'Constant Pressure Systems',
      'Water Well Maintenance',
      'Emergency Plumbing',
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'When should I call a professional to inspect my well?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Have your system checked at least once a year. Regular inspections are critical in Maryland and DC to prevent contamination from groundwater runoff and ensure the submersible pump operates within its electrical parameters. Inspect immediately if you notice low pressure, sputtering taps, or changes in water turbidity.',
        },
      },
      {
        '@type': 'Question',
        'name': 'Can I improve the water pressure in my home?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes. By installing a constant pressure controller (VFD like Franklin Electric MonoDrive) alongside a properly sized pressure tank, we can maintain constant, city-like pressure even during simultaneous use, reducing wear on the pump motor.',
        },
      },
      {
        '@type': 'Question',
        'name': 'What factors affect the cost and depth of a new well in MD & DC?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Cost depends on the geological formation of your site. In the Piedmont region (e.g. Montgomery County), wells are typically drilled into fractured rock aquifers and require less casing but greater depth (200-600 ft). In the Coastal Plain (e.g. Prince George\'s County), wells target sand aquifers, requiring extensive screen casing to filter sediment but at shallower depths. Casing materials, pump horsepower, and site access also influence the total cost.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient
        initialServices={services}
        initialProjects={projects}
        initialReviews={reviews}
      />
    </>
  );
}

