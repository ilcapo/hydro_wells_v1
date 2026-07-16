'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import {
  Briefcase,
  FileText,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    services: 0,
    projects: 0,
    pendingReviews: 0,
    averageRating: 0,
  });
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('editor');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) setCurrentUserRole(profile.role);
      }

      // Count services
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      // Count projects
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Count pending reviews
      const { count: pendingCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate average rating of approved reviews
      const { data: approvedReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('status', 'approved');

      const totalRating = approvedReviews?.reduce((acc, curr) => acc + curr.rating, 0) || 0;
      const average = approvedReviews && approvedReviews.length > 0
        ? parseFloat((totalRating / approvedReviews.length).toFixed(1))
        : 0;

      setStats({
        services: servicesCount || 0,
        projects: projectsCount || 0,
        pendingReviews: pendingCount || 0,
        averageRating: average,
      });

      // Get latest pending reviews with service name
      const { data: latestPending } = await supabase
        .from('reviews')
        .select(`
          id,
          name,
          email,
          rating,
          comment,
          created_at,
          service_id,
          services ( name )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      setPendingReviews(latestPending || []);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReviewStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    // Only admins can moderate reviews
    if (currentUserRole !== 'admin') {
      alert('Solo los administradores pueden aprobar o rechazar comentarios.');
      return;
    }

    try {
      setActionLoading(id);
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update state
      setPendingReviews(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({
        ...prev,
        pendingReviews: Math.max(0, prev.pendingReviews - 1),
      }));
    } catch (err: any) {
      alert(`Error al actualizar reseña: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-96 md:col-span-2 bg-slate-800 rounded-3xl" />
          <div className="h-96 bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-display font-semibold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,194,255,0.15)]">
          Resumen General
        </h1>
        <p className="text-slate-400 text-sm">Bienvenido al centro de administración de HydroWells.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Services Count */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl hover:border-primary/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Briefcase className="h-24 w-24 text-primary" />
          </div>
          <div className="flex items-center gap-4 text-primary">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">Servicios</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{stats.services}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/admin/services" className="hover:text-primary transition-colors flex items-center gap-1">
              Gestionar catálogo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Projects Count */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl hover:border-emerald-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText className="h-24 w-24 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4 text-emerald-400">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">Casos de Éxito</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{stats.projects}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/admin/projects" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              Gestionar proyectos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl hover:border-accent/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <MessageSquare className="h-24 w-24 text-accent" />
          </div>
          <div className="flex items-center gap-4 text-accent">
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">Comentarios Pendientes</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">{stats.pendingReviews}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Link href="/admin/reviews" className="hover:text-accent transition-colors flex items-center gap-1">
              Moderar comentarios <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Rating average */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl hover:border-yellow-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Star className="h-24 w-24 text-yellow-400" />
          </div>
          <div className="flex items-center gap-4 text-yellow-400">
            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
              <Star className="h-6 w-6" />
            </div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-medium">Valoración Media</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">
            {stats.averageRating > 0 ? `${stats.averageRating} / 5` : 'N/A'}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-0.5 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(stats.averageRating) ? 'fill-current' : 'opacity-30'
                  }`}
                />
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Moderation Queue */}
        <div className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Últimos comentarios por moderar
          </h2>

          {pendingReviews.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-white/10 rounded-2xl">
              <CheckCircle className="h-10 w-10 text-emerald-500/50 mb-3" />
              <p className="text-sm">¡Buen trabajo! No hay comentarios pendientes de moderación.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-white">{review.name}</p>
                      <p className="text-xs text-slate-500">{review.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-0.5 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'opacity-25'}`}
                          />
                        ))}
                      </span>
                      {review.services && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                          {review.services.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    {currentUserRole === 'admin' ? (
                      <>
                        <button
                          disabled={actionLoading === review.id}
                          onClick={() => handleReviewStatus(review.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1 transition-all duration-200"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Rechazar
                        </button>
                        <button
                          disabled={actionLoading === review.id}
                          onClick={() => handleReviewStatus(review.id, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all duration-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Aprobar
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <AlertCircle className="h-3.5 w-3.5 text-accent" />
                        <span>Solo Admins pueden moderar comentarios</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h2>
            <div className="grid gap-3">
              <Link
                href="/admin/services/new"
                className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 text-slate-200 hover:text-white transition-all duration-200"
              >
                <span className="text-sm font-medium">Crear Servicio</span>
                <Plus className="h-4 w-4 text-primary" />
              </Link>
              <Link
                href="/admin/projects/new"
                className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 text-slate-200 hover:text-white transition-all duration-200"
              >
                <span className="text-sm font-medium">Registrar Proyecto</span>
                <Plus className="h-4 w-4 text-emerald-400" />
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-slate-200 hover:text-white transition-all duration-200"
              >
                <span className="text-sm font-medium">Administrar Categorías</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Quick CMS Rules */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-panel backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Reglas de Seguridad</h2>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Los editores pueden crear y modificar servicios y proyectos.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">!</span>
                <span>Los comentarios inician como <strong>pending</strong> y deben ser aprobados por un <strong>admin</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400">✗</span>
                <span>Solo los usuarios con rol <strong>admin</strong> tienen permiso para eliminar contenido del sistema.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
