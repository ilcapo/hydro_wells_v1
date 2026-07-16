'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { FileText, Plus, Trash2, Edit2, CheckCircle2, XCircle, MapPin, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('editor');
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
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

      // Fetch projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update state locally
      setProjects(prev =>
        prev.map(p => (p.id === id ? { ...p, active: !currentStatus } : p))
      );
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar proyectos.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este caso de éxito? Se borrará su galería asociada.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state locally
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-slate-800 rounded-xl" />
          <div className="h-12 w-36 bg-slate-800 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-display font-semibold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,194,255,0.15)]">
            Casos de Éxito / Proyectos
          </h1>
          <p className="text-slate-400 text-sm">Gestiona los proyectos reales y obras finalizadas por HydroWells.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primaryDark hover:from-primary/90 hover:to-primaryDark/90 text-slate-950 font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,194,255,0.15)] hover:shadow-[0_0_30px_rgba(0,194,255,0.25)] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Crear Proyecto</span>
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-white/10 rounded-[2rem] bg-slate-950/20">
          <FileText className="h-14 w-14 text-slate-700 mb-4 animate-bounce" />
          <h3 className="text-lg font-medium text-slate-400">Sin casos de éxito</h3>
          <p className="text-sm mt-1 mb-6 text-slate-500">Aún no se ha documentado ningún proyecto.</p>
          <Link
            href="/admin/projects/new"
            className="px-4 py-2 text-sm bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl transition-all duration-200"
          >
            Registrar primer proyecto
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-3xl border border-white/10 bg-slate-950/40 overflow-hidden flex flex-col justify-between hover:border-primary/25 hover:shadow-[0_0_25px_rgba(0,194,255,0.08)] transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative h-44 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                {project.featured_image ? (
                  <Image
                    src={project.featured_image}
                    alt={project.title}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <ImageIcon className="h-10 w-10 opacity-40" />
                    <span className="text-xs">Sin foto destacada</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white tracking-tight line-clamp-1">{project.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 font-semibold">/projects/{project.slug}</p>
                  
                  <div className="mt-4 space-y-2">
                    {project.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    )}
                    {project.completion_date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span>{new Date(project.completion_date).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 mt-4 line-clamp-2 leading-relaxed h-10">
                    {project.description || 'Sin descripción corta.'}
                  </p>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs">
                  <button
                    onClick={() => handleToggleActive(project.id, project.active)}
                    className="flex items-center gap-1.5 font-medium transition-colors"
                  >
                    {project.active ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400">Activo (Público)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-400">Borrador</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 pb-6 pt-0 flex justify-end gap-2">
                <Link
                  href={`/admin/projects/${project.id}/edit`}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-primary/20 text-slate-200 hover:text-primary text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Editar
                </Link>
                {userRole === 'admin' ? (
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-red-500/20 text-slate-200 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </button>
                ) : (
                  <div className="h-8 flex items-center text-[10px] text-slate-500 font-mono italic">
                    Editor
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
