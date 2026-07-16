'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { Layers, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('editor');

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDataAndCategories();
  }, []);

  const fetchUserDataAndCategories = async () => {
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

      // Fetch categories
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar categorías.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto slug generation if not editing
    if (!editId) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      if (editId) {
        // Edit category
        const { error } = await supabase
          .from('service_categories')
          .update({ name, slug, description })
          .eq('id', editId);

        if (error) throw error;
      } else {
        // Create category
        const { error } = await supabase
          .from('service_categories')
          .insert([{ name, slug, description }]);

        if (error) throw error;
      }

      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setEditId(null);

      // Refresh list
      await fetchUserDataAndCategories();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar la categoría.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName('');
    setSlug('');
    setDescription('');
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar categorías.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Se desvinculará de sus servicios asociados.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-64 bg-slate-800 rounded-3xl" />
          <div className="h-64 md:col-span-2 bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-display font-semibold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,194,255,0.15)]">
          Categorías de Servicios
        </h1>
        <p className="text-slate-400 text-sm">Gestiona la clasificación para organizar los servicios de HydroWells.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {/* Form Column */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl h-fit">
          <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {editId ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="cat-name" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre
              </label>
              <input
                id="cat-name"
                type="text"
                required
                placeholder="Ej. Perforaciones, Bombas, etc."
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="cat-slug" className="block text-sm font-medium text-slate-300 mb-2">
                Slug (URL limpia)
              </label>
              <input
                id="cat-slug"
                type="text"
                required
                placeholder="ej-perforaciones"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="cat-desc" className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                id="cat-desc"
                rows={4}
                placeholder="Breve descripción del propósito de esta categoría..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-sm transition-all duration-200"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primaryDark hover:from-primary/90 hover:to-primaryDark/90 text-slate-950 font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,194,255,0.1)] hover:shadow-[0_0_20px_rgba(0,194,255,0.2)] transition-all duration-200 disabled:opacity-50"
              >
                {formLoading ? (
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : editId ? (
                  <>
                    <Check className="h-4 w-4" /> Guardar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Crear
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-5">Categorías Registradas</h2>

          {categories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-white/10 rounded-2xl">
              <Layers className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-sm">No hay categorías configuradas. Crea una usando el formulario.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-xs font-mono uppercase">
                    <th className="pb-3 font-semibold">Nombre</th>
                    <th className="pb-3 font-semibold">Slug</th>
                    <th className="pb-3 font-semibold">Descripción</th>
                    <th className="pb-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {categories.map((category) => (
                    <tr key={category.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-3 font-medium text-white">{category.name}</td>
                      <td className="py-3.5 pr-3 text-slate-400 font-mono text-xs">{category.slug}</td>
                      <td className="py-3.5 pr-3 text-slate-300 max-w-xs truncate" title={category.description}>
                        {category.description || '-'}
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300 hover:text-primary hover:border-primary/20 transition-all duration-150 inline-flex"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {userRole === 'admin' ? (
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300 hover:text-red-400 hover:border-red-400/20 transition-all duration-150 inline-flex"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="inline-block w-8 text-center text-slate-600 text-xs" title="Solo admins eliminan">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
