import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Constant Pressure Systems | HydroWells',
  description: 'HydroWells installs and maintains constant pressure systems to ensure stable water flow and reliable performance.',
};

export default function ConstantPressurePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-panel">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Constant Pressure</p>
        <h1 className="mt-6 text-5xl font-semibold text-white">Stable water pressure for modern systems.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Our constant pressure systems provide consistent flow and improved comfort while protecting equipment from wear. Ideal for homes and commercial buildings that demand reliability.
        </p>
        <div className="mt-10">
          <Link href="/#services" className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            ← Back to services
          </Link>
        </div>
      </section>
    </main>
  );
}
