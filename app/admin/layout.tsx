'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import {
  LayoutDashboard,
  Settings,
  Layers,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Briefcase
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push('/admin/login');
          return;
        }
        setUser(currentUser);

        const { data: currentProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error || !currentProfile) {
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }

        setProfile(currentProfile);
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Categorías', href: '/admin/categories', icon: Layers },
    { name: 'Servicios', href: '/admin/services', icon: Briefcase },
    { name: 'Proyectos', href: '/admin/projects', icon: FileText },
    { name: 'Comentarios', href: '/admin/reviews', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Verificando credenciales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-white">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900 border border-white/10 text-white hover:bg-slate-800"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-slate-950/95 lg:bg-slate-950/80 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out backdrop-blur-xl lg:static lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <Image
              src="/hydro-wells-logo_copia.png"
              alt="HydroWells logo"
              width={40}
              height={40}
              className="rounded-lg shadow-[0_0_15px_rgba(0,194,255,0.15)]"
            />
            <div>
              <p className="font-display font-bold tracking-wider text-sm">HYDROWELLS</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,194,255,0.05)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-900 border border-white/15 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate" title={user?.email}>
                {user?.email}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="h-3 w-3 text-accent" />
                <span className="text-[10px] uppercase font-mono tracking-wider text-accent font-semibold">
                  {profile?.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto px-6 py-8 lg:px-10 lg:py-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
