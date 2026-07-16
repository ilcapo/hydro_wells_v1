'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { Briefcase, Plus, Trash2, Edit2, CheckCircle2, XCircle, Star, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminServicesPage() {
  const supabase = createClient();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('editor');
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
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

      // Fetch services with category name
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories ( name )
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setServices(prev =>
        prev.map(s => (s.id === id ? { ...s, active: !currentStatus } : s))
      );
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setServices(prev =>
        prev.map(s => (s.id === id ? { ...s, featured: !currentStatus } : s))
      );
    } catch (err: any) {
      alert(`Error al destacar servicio: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar servicios.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este servicio? Se eliminará toda su galería y comentarios asociados.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setServices(prev => prev.filter(s => s.id !== id));
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
            Servicios
          </h1>
          <p className="text-slate-400 text-sm">Gestiona el catálogo de servicios de agua ofrecidos por HydroWells.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primaryDark hover:from-primary/90 hover:to-primaryDark/90 text-slate-950 font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,194,255,0.15)] hover:shadow-[0_0_30px_rgba(0,194,255,0.25)] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Crear Servicio</span>
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-white/10 rounded-[2rem] bg-slate-950/20">
          <Briefcase className="h-14 w-14 text-slate-700 mb-4 animate-bounce" />
          <h3 className="text-lg font-medium text-slate-400">Catálogo vacío</h3>
          <p className="text-sm mt-1 mb-6 text-slate-500">No hay ningún servicio registrado.</p>
          <Link
            href="/admin/services/new"
            className="px-4 py-2 text-sm bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl transition-all duration-200"
          >
            Agregar primer servicio
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-3xl border border-white/10 bg-slate-950/40 overflow-hidden flex flex-col justify-between hover:border-primary/25 hover:shadow-[0_0_25px_rgba(0,194,255,0.08)] transition-all duration-300"
            >
              {/* Card Image Thumbnail */}
              <div className="relative h-44 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
                {service.featured_image ? (
                  <Image
                    src={service.featured_image}
                    alt={service.name}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <ImageIcon className="h-10 w-10 opacity-40" />
                    <span className="text-xs">Sin imagen principal</span>
                  </div>
                )}
                {/* Category Badge */}
                {service.service_categories && (
                  <span className="absolute top-3 left-3 text-xs bg-slate-950/90 text-primary px-3 py-1 rounded-full border border-primary/20 font-medium backdrop-blur-sm shadow-panel">
                    {service.service_categories.name}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white tracking-tight line-clamp-1">{service.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 font-semibold">/services/{service.slug}</p>
                  <p className="text-sm text-slate-300 mt-3 line-clamp-2 leading-relaxed h-10">
                    {service.short_description || 'Sin descripción corta.'}
                  </p>
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5 text-xs">
                  <button
                    onClick={() => handleToggleActive(service.id, service.active)}
                    className="flex items-center gap-1.5 font-medium transition-colors"
                  >
                    {service.active ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400">Activo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-400">Inactivo</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(service.id, service.featured)}
                    className="flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <Star
                      className={`h-4 w-4 ${service.featured ? 'text-yellow-400 fill-current' : 'text-slate-500'}`}
                    />
                    <span className={service.featured ? 'text-yellow-400' : 'text-slate-400'}>
                      {service.featured ? 'Destacado' : 'Destacar'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 pb-6 pt-0 flex justify-end gap-2">
                <Link
                  href={`/admin/services/${service.id}/edit`}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-primary/20 text-slate-200 hover:text-primary text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
                  title="Editar Servicio y Galería"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Editar
                </Link>
                {userRole === 'admin' ? (
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-red-500/20 text-slate-200 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
                    title="Eliminar Servicio"
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
