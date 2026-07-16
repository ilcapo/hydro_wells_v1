'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../../lib/supabase/client';
import {
  ArrowLeft,
  Save,
  FileText,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Trash2,
  Star,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { compressImage } from '../../../../../lib/imageCompressor';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminEditProjectPage({ params }: EditProjectPageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('editor');

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  // Gallery states
  const [gallery, setGallery] = useState<any[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Check role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile) setUserRole(profile.role);
        }

        // Load project details
        const { data: project, error: prjError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (prjError) throw prjError;
        if (!project) throw new Error('Proyecto no encontrado.');

        setTitle(project.title);
        setSlug(project.slug);
        setLocation(project.location || '');
        setCompletionDate(project.completion_date || '');
        setDescription(project.description || '');
        setActive(project.active);
        setFeaturedImage(project.featured_image);

        // Load project images gallery
        await loadGallery();
      } catch (err: any) {
        console.error('Error loading project:', err);
        setError(err.message || 'Error al cargar el proyecto.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId, supabase]);

  const loadGallery = async () => {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading gallery:', error);
    } else {
      setGallery(data || []);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  // Upload main featured image
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
      const fileName = `${projectId}/banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, uploadFile, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ featured_image: publicUrl })
        .eq('id', projectId);

      if (updateError) throw updateError;

      setFeaturedImage(publicUrl);
    } catch (err: any) {
      setError(`Error al subir imagen destacada: ${err.message}`);
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
        const fileName = `${projectId}/gallery-${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);

        // Insert row in project_images
        const { error: dbError } = await supabase
          .from('project_images')
          .insert([{
            project_id: projectId,
            image_url: publicUrl,
            caption: file.name.split('.')[0]
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

  const handleSetFeaturedFromGallery = async (url: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('projects')
        .update({ featured_image: url })
        .eq('id', projectId);

      if (error) throw error;
      setFeaturedImage(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

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
        .from('project_images')
        .delete()
        .eq('id', imgId);

      if (dbError) throw dbError;

      // 2. Remove from Storage
      try {
        const urlParts = url.split('/storage/v1/object/public/project-images/');
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from('project-images').remove([filePath]);
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
      if (!title.trim() || !slug.trim()) {
        throw new Error('El título y el slug son requeridos.');
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title,
          slug,
          location: location || null,
          completion_date: completionDate || null,
          description,
          active
        })
        .eq('id', projectId);

      if (updateError) throw updateError;

      router.push('/admin/projects');
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
          href="/admin/projects"
          className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-primary/20 text-slate-400 hover:text-white transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-display font-semibold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,194,255,0.15)]">
            Editar Proyecto
          </h1>
          <p className="text-slate-400 text-sm">Edita la descripción y gestiona la galería de imágenes del caso de éxito.</p>
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
              <FileText className="h-5 w-5 text-primary" /> Información General
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="prj-title" className="block text-sm font-medium text-slate-300 mb-2">
                  Título
                </label>
                <input
                  id="prj-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="prj-slug" className="block text-sm font-medium text-slate-300 mb-2">
                  Slug (URL limpia)
                </label>
                <input
                  id="prj-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="prj-loc" className="block text-sm font-medium text-slate-300 mb-2">
                  Ubicación (Ciudad, Estado)
                </label>
                <input
                  id="prj-loc"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="prj-date" className="block text-sm font-medium text-slate-300 mb-2">
                  Fecha de Finalización
                </label>
                <input
                  id="prj-date"
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prj-desc" className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                id="prj-desc"
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/admin/projects"
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

        {/* Media Sidebar Column */}
        <div className="space-y-6">
          {/* Status Settings */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl space-y-4">
            <h2 className="text-lg font-semibold text-white">Estado</h2>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-5 w-5 rounded-lg border-white/10 bg-slate-900 focus:ring-primary/50 text-primary transition"
              />
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Activo (Visible en web)</p>
              </div>
            </label>
          </div>

          {/* Project Featured Image */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" /> Foto de Portada
            </h2>

            {featuredImage ? (
              <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-white/10">
                <Image src={featuredImage} alt="Featured project image" fill className="object-cover" />
              </div>
            ) : (
              <div className="h-40 w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <ImageIcon className="h-8 w-8 opacity-45" />
                <span>Sin foto de portada</span>
              </div>
            )}

            <label className="w-full py-3.5 rounded-xl border border-white/10 hover:border-primary/20 bg-slate-900/60 text-slate-300 hover:text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200">
              {uploadingBanner ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{uploadingBanner ? 'Subiendo...' : 'Subir Portada'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
                className="hidden"
              />
            </label>
          </div>

          {/* Project Gallery */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Galería del Proyecto</h2>
              <span className="text-xs text-slate-400 font-mono">{gallery.length} fotos</span>
            </div>

            {/* Gallery Upload Button */}
            <label className="w-full py-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-glow">
              {uploadingGallery ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{uploadingGallery ? 'Subiendo fotos...' : 'Subir a la Galería'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={uploadingGallery}
                className="hidden"
              />
            </label>

            {/* Gallery items list */}
            {gallery.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">La galería de este proyecto está vacía.</p>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all"
                  >
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <Image src={img.image_url} alt="Project thumbnail" fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-300 truncate" title={img.caption}>
                          {img.caption || 'Foto de obra'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Set as featured */}
                        <button
                          onClick={() => handleSetFeaturedFromGallery(img.image_url)}
                          className={`p-1 rounded bg-slate-950 border border-white/5 transition ${
                            featuredImage === img.image_url
                              ? 'text-yellow-400'
                              : 'text-slate-400 hover:text-yellow-400'
                          }`}
                          title="Hacer foto de portada"
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
