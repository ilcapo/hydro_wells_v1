'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Phone, ArrowLeft, Image as ImageIcon, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { GalleryItem } from './page';

interface GalleryClientProps {
  initialImages: GalleryItem[];
}

export default function GalleryClient({ initialImages }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filtered images list
  const filteredImages = initialImages.filter((img) => {
    if (selectedCategory === 'All') return true;
    return img.category === selectedCategory;
  });

  // Categories list
  const categories = ['All', 'Services', 'Projects', 'Client Evidences'];

  // Lightbox navigation functions
  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setLightboxIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  const currentImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 pb-24 pt-10 text-slate-100">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 bg-hero-glow opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        
        {/* Navigation / Header bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-4 shadow-panel backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Image
              src="/hydro-wells-logo_copia.png"
              alt="HydroWells logo"
              width={40}
              height={40}
              className="rounded-xl shadow-[0_0_15px_rgba(0,194,255,0.2)]"
            />
            <div className="leading-tight text-left">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200/90 font-semibold font-mono">HYDROWELLS</p>
              <p className="text-[10px] text-slate-400">Water solutions gallery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <a href="tel:3013937090" className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-primary border border-primary/20 transition hover:bg-slate-800/90">
              <Phone className="h-3 w-3" />
              301-393-7090
            </a>
          </div>
        </motion.header>

        {/* Title area */}
        <section className="mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center"
          >
            <Badge variant="secondary" className="mb-4">
              <ImageIcon className="h-3 w-3 mr-1.5 text-primary" /> Visual Portfolio
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl drop-shadow-[0_0_20px_rgba(0,194,255,0.15)]">
              Our Work and Client Proof
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Browse through authentic images of our well drilling, pump repair, and constant pressure system installations across Maryland and Washington DC.
            </p>
          </motion.div>
        </section>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 border ${
                selectedCategory === cat
                  ? 'bg-primary text-slate-950 border-primary shadow-[0_0_15px_rgba(0,194,255,0.3)]'
                  : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-primary/40 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, idx) => (
              <motion.div
                layout
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-2 shadow-panel backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,194,255,0.15)]"
                onClick={() => setLightboxIndex(idx)}
              >
                {/* Photo container */}
                <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-900">
                  <Image
                    src={img.url}
                    alt={img.caption}
                    fill
                    sizes="(max-w-640px) 100vw, (max-w-1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category label badge on image */}
                  <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-sky-300 backdrop-blur-md border border-white/10">
                    {img.category}
                  </span>
                </div>

                {/* Info Area */}
                <div className="mt-3 px-2 pb-1 text-left">
                  <p className="text-[11px] uppercase tracking-wider text-sky-200/80 font-semibold font-mono truncate">
                    {img.originName}
                  </p>
                  <p className="mt-1 text-xs text-slate-300 line-clamp-2 min-h-[2rem]">
                    {img.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 rounded-[2rem] border border-white/10 bg-slate-900/40 p-12 text-center"
          >
            <ImageIcon className="mx-auto h-12 w-12 text-slate-600 mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-white">No images found</h3>
            <p className="mt-2 text-sm text-slate-400">There are currently no images uploaded in this category.</p>
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Topbar: Close button and counter */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 text-slate-300 z-55">
              <span className="text-sm font-mono bg-slate-900/80 px-3 py-1.5 rounded-full border border-white/5">
                {lightboxIndex + 1} / {filteredImages.length}
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="rounded-full bg-slate-900/80 p-2 text-white border border-white/10 hover:bg-slate-800 transition shadow-glow"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Left controller */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-3 text-white border border-white/5 hover:bg-slate-800/90 transition hover:scale-105 z-55"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Main Interactive Center (Image View) */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-h-[70vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-slate-900/50 shadow-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full h-[55vh]">
                <Image
                  src={currentImage.url}
                  alt={currentImage.caption}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Bottom details card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-left shadow-panel backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-mono font-semibold text-primary border border-primary/20">
                {currentImage.category}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-white tracking-tight flex items-center justify-between gap-3">
                {currentImage.originName}
                {currentImage.originUrl && (
                  <Link
                    href={currentImage.originUrl}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 hover:text-sky-200 transition bg-slate-950/40 border border-sky-300/20 px-2.5 py-1 rounded-md"
                    onClick={() => setLightboxIndex(null)}
                  >
                    View Details <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {currentImage.caption}
              </p>
            </motion.div>

            {/* Right controller */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/70 p-3 text-white border border-white/5 hover:bg-slate-800/90 transition hover:scale-105 z-55"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
