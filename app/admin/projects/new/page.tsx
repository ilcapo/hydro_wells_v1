'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { ArrowLeft, Save, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminNewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!title.trim() || !slug.trim()) {
        throw new Error('El título y el slug son requeridos.');
      }

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([{
          title,
          slug,
          location: location || null,
          completion_date: completionDate || null,
          description,
          active
        }])
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Redirect to edit page so they can upload images
      router.push(`/admin/projects/${data.id}/edit`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el proyecto.');
      setSaving(false);
    }
  };

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
            Nuevo Proyecto
          </h1>
          <p className="text-slate-400 text-sm">Registra un nuevo caso de éxito / obra finalizada para HydroWells.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl space-y-5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Información General
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="prj-title" className="block text-sm font-medium text-slate-300 mb-2">
                  Título del Proyecto
                </label>
                <input
                  id="prj-title"
                  type="text"
                  required
                  placeholder="Ej. Instalación de pozo de 300 pies en Dickerson"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
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
                  placeholder="ej-instalacion-de-pozo-dickerson"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
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
                  placeholder="Ej. Dickerson, MD"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
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
                Descripción del Proyecto
              </label>
              <textarea
                id="prj-desc"
                rows={6}
                required
                placeholder="Describe el alcance de la obra, los retos técnicos superados, maquinaria utilizada y los resultados del sistema de agua instalado..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Status Column */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 shadow-panel backdrop-blur-xl space-y-5">
            <h2 className="text-xl font-semibold text-white">Configuración</h2>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-5 w-5 rounded-lg border-white/10 bg-slate-900 focus:ring-primary/50 text-primary transition"
              />
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Proyecto Activo</p>
                <p className="text-xs text-slate-400">Si se desmarca, se guardará como borrador.</p>
              </div>
            </label>
          </div>

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
                <span>Registrar y Continuar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
