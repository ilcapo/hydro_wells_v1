'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../lib/supabase/client';
import {
  ArrowLeft,
  Save,
  Briefcase,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { compressImage } from '../../../../../lib/imageCompressor';

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditServicePage({ params }: EditServicePageProps) {
  // Unwrap params using React.use()
  const { id: serviceId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('editor');

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Gallery states
  const [gallery, setGallery] = useState<any[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Check user role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile) setUserRole(profile.role);
        }

        // Load categories
        const { data: catData, error: catError } = await supabase
          .from('service_categories')
          .select('id, name')
          .order('name', { ascending: true });

        if (catError) throw catError;
        setCategories(catData || []);

        // Load service details
        const { data: service, error: srvError } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (srvError) throw srvError;
        if (!service) throw new Error('Servicio no encontrado.');

        setName(service.name);
        setSlug(service.slug);
        setCategoryId(service.category_id || '');
        setShortDesc(service.short_description || '');
        setFullDesc(service.full_description || '');
        setActive(service.active);
        setFeatured(service.featured);
        setFeaturedImage(service.featured_image);
        setMetaTitle(service.meta_title || '');
        setMetaDescription(service.meta_description || '');

        // Load gallery images
        await loadGallery();
      } catch (err: any) {
        console.error('Error loading service:', err);
        setError(err.message || 'Error al cargar el servicio.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [serviceId, supabase]);

  const loadGallery = async () => {
    const { data, error } = await supabase
      .from('service_images')
      .select('*')
      .eq('service_id', serviceId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading gallery:', error);
    } else {
      setGallery(data || []);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  // Upload main banner image
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      setError(null);

      let uploadFile = file;
      if (file.type.startsWith('image/')) {
        try {
          uploadFile = await compressImage(file, 1600, 0.85);
        } catch (compressErr) {
          console.error('Failed to compress image:', compressErr);
        }
      }

      const fileExt = uploadFile.name.split('.').pop() || 'webp';
      const fileName = `${serviceId}/banner-${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(fileName, uploadFile, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(fileName);

      // Save in service row immediately
      const { error: updateError } = await supabase
        .from('services')
        .update({ featured_image: publicUrl })
        .eq('id', serviceId);

      if (updateError) throw updateError;

      setFeaturedImage(publicUrl);
    } catch (err: any) {
      setError(`Error al subir banner: ${err.message}`);
    } finally {
      setUploadingBanner(false);
    }
  };

  // Upload multiple images to gallery
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingGallery(true);
      setError(null);

      // We determine the current max sort order to append these images
      const maxOrder = gallery.reduce((max, img) => Math.max(max, img.sort_order), -1);
      let currentOrder = maxOrder + 1;

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        
        if (file.type.startsWith('image/')) {
          try {
            file = await compressImage(file, 1600, 0.85);
          } catch (compressErr) {
            console.error('Failed to compress image:', compressErr);
          }
        }

        const fileExt = file.name.split('.').pop() || 'webp';
        const fileName = `${serviceId}/gallery-${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(fileName);

        // Insert row in service_images
        const { error: dbError } = await supabase
          .from('service_images')
          .insert([{
            service_id: serviceId,
            image_url: publicUrl,
            caption: file.name.split('.')[0],
            sort_order: currentOrder++
          }]);

        if (dbError) throw dbError;
      }

      await loadGallery();
    } catch (err: any) {
      setError(`Error al subir imágenes de galería: ${err.message}`);
    } finally {
      setUploadingGallery(false);
    }
  };

  // Set a gallery image as the main service featured image
  const handleSetFeaturedFromGallery = async (url: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('services')
        .update({ featured_image: url })
        .eq('id', serviceId);

      if (error) throw error;
      setFeaturedImage(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Reorder gallery items
  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === gallery.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = gallery[index];
    const targetItem = gallery[targetIndex];

    try {
      // Swap sort_order
      const currentOrder = currentItem.sort_order;
      const targetOrder = targetItem.sort_order;

      const { error: err1 } = await supabase
        .from('service_images')
        .update({ sort_order: targetOrder })
        .eq('id', currentItem.id);

      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from('service_images')
        .update({ sort_order: currentOrder })
        .eq('id', targetItem.id);

      if (err2) throw err2;

      // Update state locally to animate instantly
      const newGallery = [...gallery];
      newGallery[index] = { ...targetItem, sort_order: currentOrder };
      newGallery[targetIndex] = { ...currentItem, sort_order: targetOrder };
      setGallery(newGallery.sort((a, b) => a.sort_order - b.sort_order));
    } catch (err: any) {
      console.error(err);
      setError('Error al reordenar las imágenes.');
    }
  };

  // Delete image from gallery
  const handleDeleteGalleryItem = async (imgId: string, url: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar imágenes.');
      return;
    }

    if (!confirm('¿Deseas eliminar esta imagen de la galería?')) return;

    try {
      setError(null);

      // 1. Delete from database
      const { error: dbError } = await supabase
        .from('service_images')
        .delete()
        .eq('id', imgId);

      if (dbError) throw dbError;

      // 2. Try deleting from Storage if url points to our storage
      try {
        const urlParts = url.split('/storage/v1/object/public/service-images/');
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from('service-images').remove([filePath]);
        }
      } catch (err) {
        console.error('Error removing file from storage:', err);
      }

      setGallery(prev => prev.filter(img => img.id !== imgId));
    } catch (err: any) {
      setError(`Error al eliminar imagen: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!name.trim() || !slug.trim()) {
        throw new Error('El nombre y el slug son requeridos.');
      }

      const { error: updateError } = await supabase
        .from('services')
        .update({
          name,
          slug,
          category_id: categoryId || null,
          short_description: shortDesc,
          full_description: fullDesc,
          active,
          featured,
          meta_title: metaTitle,
          meta_description: metaDescription
        })
        .eq('id', serviceId);

      if (updateError) throw updateError;

      router.push('/admin/services');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar cambios.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-xl" />
        <div className="h-96 bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/services"
          className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-primary/20 text-slate-400 hover:text-white transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-display font-semibold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,194,255,0.15)]">
            Editar Servicio
          </h1>
          <p className="text-slate-400 text-sm">Modifica los detalles y la galería multimedia del servicio.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl space-y-5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Información del Servicio
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="srv-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre
                </label>
                <input
                  id="srv-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="srv-slug" className="block text-sm font-medium text-slate-300 mb-2">
                  Slug (URL limpia)
                </label>
                <input
                  id="srv-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="srv-cat" className="block text-sm font-medium text-slate-300 mb-2">
                Categoría
              </label>
              <select
                id="srv-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="srv-short" className="block text-sm font-medium text-slate-300 mb-2">
                Descripción Corta (Vista de Tarjeta)
              </label>
              <textarea
                id="srv-short"
                rows={3}
                required
                maxLength={200}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label htmlFor="srv-full" className="block text-sm font-medium text-slate-300 mb-2">
                Descripción Detallada
              </label>
              <textarea
                id="srv-full"
                rows={8}
                required
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* SEO Panel */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl space-y-5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> Configuración SEO
            </h2>

            <div>
              <label htmlFor="srv-mtitle" className="block text-sm font-medium text-slate-300 mb-2">
                Meta Title
              </label>
              <input
                id="srv-mtitle"
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="srv-mdesc" className="block text-sm font-medium text-slate-300 mb-2">
                Meta Description
              </label>
              <textarea
                id="srv-mdesc"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex gap-4">
            <Link
              href="/admin/services"
              className="flex-1 py-4 rounded-xl border border-white/10 text-center font-semibold text-slate-300 hover:bg-white/5 transition-all duration-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-primary to-primaryDark hover:from-primary/90 hover:to-primaryDark/90 text-slate-950 font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,194,255,0.15)] hover:shadow-[0_0_30px_rgba(0,194,255,0.25)] transition-all duration-200"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>

        {/* Media & Gallery Management Column */}
        <div className="space-y-6">
          {/* Active Settings */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl space-y-4">
            <h2 className="text-lg font-semibold text-white">Estado</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-white/10 bg-slate-900 focus:ring-primary/50 text-primary transition"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Activo</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-white/10 bg-slate-900 focus:ring-primary/50 text-primary transition"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Destacado</p>
                </div>
              </label>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" /> Banner Principal
            </h2>

            {featuredImage ? (
              <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-white/10">
                <Image src={featuredImage} alt="Featured banner" fill className="object-cover" />
              </div>
            ) : (
              <div className="h-40 w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <ImageIcon className="h-8 w-8 opacity-45" />
                <span>Sin imagen de cabecera</span>
              </div>
            )}

            <label className="w-full py-3.5 rounded-xl border border-white/10 hover:border-primary/20 bg-slate-900/60 text-slate-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200">
              {uploadingBanner ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{uploadingBanner ? 'Subiendo...' : 'Subir Banner'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
                className="hidden"
              />
            </label>
          </div>

          {/* Service Gallery Images */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Galería de Fotos</h2>
              <span className="text-xs text-slate-400 font-mono">{gallery.length} fotos</span>
            </div>

            {/* Gallery Upload Input */}
            <label className="w-full py-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-glow">
              {uploadingGallery ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{uploadingGallery ? 'Subiendo fotos...' : 'Agregar a Galería'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={uploadingGallery}
                className="hidden"
              />
            </label>

            {/* Images list */}
            {gallery.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">La galería está vacía. Agrega fotos arriba.</p>
            ) : (
              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {gallery.map((img, index) => (
                  <div
                    key={img.id}
                    className="group/item flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <Image src={img.image_url} alt="Gallery thumbnail" fill className="object-cover" />
                    </div>

                    {/* Actions */}
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-300 truncate" title={img.caption}>
                          {img.caption || 'Foto'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Orden: {img.sort_order}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          onClick={() => handleReorder(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded bg-slate-950 border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 transition"
                          title="Subir orden"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          onClick={() => handleReorder(index, 'down')}
                          disabled={index === gallery.length - 1}
                          className="p-1 rounded bg-slate-950 border border-white/5 text-slate-400 hover:text-white disabled:opacity-30 transition"
                          title="Bajar orden"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Set as banner */}
                        <button
                          onClick={() => handleSetFeaturedFromGallery(img.image_url)}
                          className={`p-1 rounded bg-slate-950 border border-white/5 transition ${
                            featuredImage === img.image_url
                              ? 'text-yellow-400'
                              : 'text-slate-400 hover:text-yellow-400'
                          }`}
                          title="Hacer banner principal"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>

                        {/* Delete */}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteGalleryItem(img.id, img.image_url)}
                            className="p-1 rounded bg-slate-950 border border-white/5 text-slate-400 hover:text-red-400 transition"
                            title="Eliminar foto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
