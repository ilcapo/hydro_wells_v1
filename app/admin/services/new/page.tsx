'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { ArrowLeft, Save, Briefcase, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdminNewServicePage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('service_categories')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
        if (data && data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch (err: any) {
        console.error('Error loading categories:', err);
        setError('No se pudieron cargar las categorías de servicios.');
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [supabase]);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto slugify
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setSlug(generatedSlug);
    // Also suggest a meta title
    setMetaTitle(`${val} | HydroWells Maryland & DC`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!name.trim() || !slug.trim()) {
        throw new Error('El nombre y el slug son requeridos.');
      }

      const { error: insertError } = await supabase
        .from('services')
        .insert([{
          name,
          slug,
          category_id: categoryId || null,
          short_description: shortDesc,
          full_description: fullDesc,
          active,
          featured,
          meta_title: metaTitle,
          meta_description: metaDescription
        }]);

      if (insertError) throw insertError;

      router.push('/admin/services');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al crear el servicio.');
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
            Nuevo Servicio
          </h1>
          <p className="text-slate-400 text-sm">Registra una nueva oferta técnica en el catálogo de HydroWells.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        {/* Primary Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl space-y-5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Informacion Principal
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="srv-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre del Servicio
                </label>
                <input
                  id="srv-name"
                  type="text"
                  required
                  placeholder="Ej. Reparación de Bombas Sumergibles"
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
                  placeholder="ej-reparacion-de-bombas"
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
                {categories.length === 0 ? (
                  <option value="">-- No hay categorías disponibles --</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
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
                placeholder="Breve resumen que capturará la atención del cliente (máx 200 caracteres)..."
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label htmlFor="srv-full" className="block text-sm font-medium text-slate-300 mb-2">
                Descripción Detallada (Página de Servicio)
              </label>
              <textarea
                id="srv-full"
                rows={8}
                required
                placeholder="Detalla cómo funciona el servicio, especificaciones técnicas, problemas comunes que resuelve y garantías..."
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Sidebar & SEO Column */}
        <div className="space-y-6">
          {/* Settings Panel */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl space-y-5">
            <h2 className="text-xl font-semibold text-white">Configuración</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-white/10 bg-slate-900 focus:ring-primary/50 text-primary transition"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Servicio Activo</p>
                  <p className="text-xs text-slate-400">Determina si es visible públicamente.</p>
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
                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Destacar Servicio</p>
                  <p className="text-xs text-slate-400">Mostrar de forma prioritaria en la Home.</p>
                </div>
              </label>
            </div>
          </div>

          {/* SEO Metadata Panel */}
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
                placeholder="Título para motores de búsqueda"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="srv-mdesc" className="block text-sm font-medium text-slate-300 mb-2">
                Meta Description
              </label>
              <textarea
                id="srv-mdesc"
                rows={3}
                placeholder="Descripción para motores de búsqueda..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primaryDark hover:from-primary/90 hover:to-primaryDark/90 text-slate-950 font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,194,255,0.15)] hover:shadow-[0_0_30px_rgba(0,194,255,0.25)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Guardar Servicio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
