'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  FileVideo,
  FileImage,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';

export default function AdminReviewsPage() {
  const supabase = createClient();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('editor');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
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

      // Fetch reviews with joined service name and review media
      const { data, error: fetchErr } = await supabase
        .from('reviews')
        .select(`
          *,
          services ( name ),
          review_media ( id, file_url, file_type )
        `)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden cambiar el estado de los comentarios.');
      return;
    }

    try {
      setActionLoading(id);
      setError(null);

      const { error: updateErr } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateErr) throw updateErr;

      // Update state locally
      setReviews(prev =>
        prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      setError(`Error al actualizar estado: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar comentarios.');
      return;
    }

    if (!confirm('¿Deseas eliminar definitivamente este comentario del sistema?')) return;

    try {
      setActionLoading(id);
      setError(null);

      const { error: deleteErr } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;

      // Update state locally
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(`Error al eliminar comentario: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter reviews depending on the active tab
  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    return review.status === activeTab;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-xl" />
        <div className="h-12 w-96 bg-slate-800 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-display font-semibold tracking-tight text-white drop-shadow-[0_0_15px_rgba(0,194,255,0.15)]">
          Comentarios y Reseñas
        </h1>
        <p className="text-slate-400 text-sm">Modera los testimonios de los clientes y visualiza evidencias de obras (fotos y videos).</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-white/10 p-1 gap-2 bg-slate-950/20 rounded-2xl w-fit">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeTab === tab
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab === 'pending' && 'Pendientes'}
            {tab === 'approved' && 'Aprobados'}
            {tab === 'rejected' && 'Rechazados'}
            {tab === 'all' && 'Todos'}
          </button>
        ))}
      </div>

      {/* Review Queue */}
      {filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-white/10 rounded-[2rem] bg-slate-950/10">
          <MessageSquare className="h-14 w-14 text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-slate-400">Bandeja Vacía</h3>
          <p className="text-sm mt-1 text-slate-500">No hay comentarios en este estado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`p-6 rounded-3xl border transition-all duration-300 ${
                review.status === 'pending'
                  ? 'border-white/10 bg-slate-950/40 hover:border-accent/25'
                  : review.status === 'approved'
                  ? 'border-white/10 bg-slate-950/40 hover:border-emerald-500/25'
                  : 'border-white/10 bg-slate-950/40 hover:border-red-500/25'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* User details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-lg text-white">{review.name}</span>
                    <span className="text-xs text-slate-500 font-mono">({review.email})</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold border ${
                      review.status === 'pending'
                        ? 'bg-accent/10 border-accent/20 text-accent'
                        : review.status === 'approved'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {review.status}
                    </span>
                  </div>

                  {review.services && (
                    <p className="text-xs text-slate-400">
                      Servicio evaluado:{' '}
                      <span className="text-primary font-medium">{review.services.name}</span>
                    </p>
                  )}

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'opacity-20'}`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-slate-300 italic text-sm leading-relaxed pt-2">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Date */}
                <div className="text-xs text-slate-500 md:text-right shrink-0">
                  {new Date(review.created_at).toLocaleDateString('es-ES', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
              </div>

              {/* Media Attachments Section (review_media) */}
              {review.review_media && review.review_media.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5 space-y-2.5">
                  <p className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">Evidencias Adjuntas:</p>
                  <div className="flex flex-wrap gap-4">
                    {review.review_media.map((media: any) => (
                      <div
                        key={media.id}
                        className="group/media relative h-28 w-40 rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center shadow-panel"
                      >
                        {media.file_type.startsWith('image') || media.file_type === 'image' ? (
                          <>
                            <Image
                              src={media.file_url}
                              alt="Review attachment"
                              fill
                              sizes="(max-w-500px) 150px"
                              className="object-cover"
                            />
                            <a
                              href={media.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity"
                            >
                              <ExternalLink className="h-4 w-4" /> Ver Foto
                            </a>
                          </>
                        ) : (
                          <div className="p-4 w-full h-full flex flex-col items-center justify-center text-center gap-1">
                            <FileVideo className="h-8 w-8 text-sky-400 animate-pulse" />
                            <a
                              href={media.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-sky-300 hover:underline flex items-center gap-1 font-semibold"
                            >
                              Reproducir Video <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
                {userRole === 'admin' ? (
                  <>
                    {review.status !== 'rejected' && (
                      <button
                        disabled={actionLoading === review.id}
                        onClick={() => handleStatusUpdate(review.id, 'rejected')}
                        className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1 transition-all duration-200"
                      >
                        <XCircle className="h-4 w-4" /> Rechazar
                      </button>
                    )}
                    {review.status !== 'approved' && (
                      <button
                        disabled={actionLoading === review.id}
                        onClick={() => handleStatusUpdate(review.id, 'approved')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all duration-200 shadow-glow"
                      >
                        <CheckCircle className="h-4 w-4" /> Aprobar Publicación
                      </button>
                    )}
                    <button
                      disabled={actionLoading === review.id}
                      onClick={() => handleDelete(review.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-red-500/20 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono italic">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <span>Solo administradores pueden moderar comentarios</span>
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
