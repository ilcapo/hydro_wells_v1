-- SCHEMA FOR HYDROWELLS V2 CMS

-- Enable extensions if not enabled
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =========================================================================
-- 1. TABLES CREATION
-- =========================================================================

-- Profiles table to store user roles (admin / editor)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz default now() not null
);

-- Service categories
create table if not exists public.service_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text
);

-- Services
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  featured_image text,
  category_id uuid references public.service_categories(id) on delete set null,
  active boolean default true not null,
  featured boolean default false not null,
  meta_title text,
  meta_description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Service images (gallery)
create table if not exists public.service_images (
  id uuid default gen_random_uuid() primary key,
  service_id uuid references public.services(id) on delete cascade not null,
  image_url text not null,
  caption text,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Success cases / Projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  description text,
  location text,
  featured_image text,
  completion_date date,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Project images (gallery)
create table if not exists public.project_images (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  image_url text not null,
  caption text,
  created_at timestamptz default now() not null
);

-- Moderated system reviews
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  service_id uuid references public.services(id) on delete set null,
  name text not null,
  email text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'pending' not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now() not null
);

-- Evidence media (images/videos) associated to reviews
create table if not exists public.review_media (
  id uuid default gen_random_uuid() primary key,
  review_id uuid references public.reviews(id) on delete cascade not null,
  file_url text not null,
  file_type text not null, -- 'image' or 'video'
  created_at timestamptz default now() not null
);

-- =========================================================================
-- 2. HELPER FUNCTIONS
-- =========================================================================

-- Function to check current user's role from public.profiles
create or replace function public.get_my_role()
returns text as $$
declare
  user_role text;
begin
  select role into user_role from public.profiles where id = auth.uid();
  return coalesce(user_role, 'visitor');
end;
$$ language plpgsql security definer;

-- Trigger to automatically create a profile for new auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- The first user to sign up will be 'admin' to bootstrap the panel,
  -- subsequent users will be 'editor' by default.
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when not exists (select 1 from public.profiles) then 'admin'
      else 'editor'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to update services/projects updated_at field
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_services_timestamp on public.services;
create trigger update_services_timestamp
  before update on public.services
  for each row execute procedure public.handle_update_timestamp();

drop trigger if exists update_projects_timestamp on public.projects;
create trigger update_projects_timestamp
  before update on public.projects
  for each row execute procedure public.handle_update_timestamp();

-- =========================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_images enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.reviews enable row level security;
alter table public.review_media enable row level security;

-- Clean existing policies to prevent naming collisions
drop policy if exists "Allow read profiles to authenticated users" on public.profiles;
drop policy if exists "Allow update profiles for own user" on public.profiles;

drop policy if exists "Allow read categories to everyone" on public.service_categories;
drop policy if exists "Allow insert categories to editors and admins" on public.service_categories;
drop policy if exists "Allow update categories to editors and admins" on public.service_categories;
drop policy if exists "Allow delete categories to admins only" on public.service_categories;

drop policy if exists "Allow read active services to everyone" on public.services;
drop policy if exists "Allow insert services to editors and admins" on public.services;
drop policy if exists "Allow update services to editors and admins" on public.services;
drop policy if exists "Allow delete services to admins only" on public.services;

drop policy if exists "Allow read service images to everyone" on public.service_images;
drop policy if exists "Allow insert service images to editors and admins" on public.service_images;
drop policy if exists "Allow update service images to editors and admins" on public.service_images;
drop policy if exists "Allow delete service images to admins only" on public.service_images;

drop policy if exists "Allow read active projects to everyone" on public.projects;
drop policy if exists "Allow insert projects to editors and admins" on public.projects;
drop policy if exists "Allow update projects to editors and admins" on public.projects;
drop policy if exists "Allow delete projects to admins only" on public.projects;

drop policy if exists "Allow read project images to everyone" on public.project_images;
drop policy if exists "Allow insert project images to editors and admins" on public.project_images;
drop policy if exists "Allow update project images to editors and admins" on public.project_images;
drop policy if exists "Allow delete project images to admins only" on public.project_images;

drop policy if exists "Allow read approved reviews to everyone" on public.reviews;
drop policy if exists "Allow insert reviews to everyone" on public.reviews;
drop policy if exists "Allow update reviews to editors and admins" on public.reviews;
drop policy if exists "Allow delete reviews to admins only" on public.reviews;

drop policy if exists "Allow read approved review media to everyone" on public.review_media;
drop policy if exists "Allow insert review media to everyone" on public.review_media;
drop policy if exists "Allow delete review media to admins only" on public.review_media;

-- --- PROFILES POLICIES ---
create policy "Allow read profiles to authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Allow update profiles for own user"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- --- SERVICE CATEGORIES POLICIES ---
create policy "Allow read categories to everyone"
  on public.service_categories for select
  using (true);

create policy "Allow insert categories to editors and admins"
  on public.service_categories for insert
  to authenticated
  with check (public.get_my_role() in ('admin', 'editor'));

create policy "Allow update categories to editors and admins"
  on public.service_categories for update
  to authenticated
  using (public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete categories to admins only"
  on public.service_categories for delete
  to authenticated
  using (public.get_my_role() = 'admin');

-- --- SERVICES POLICIES ---
create policy "Allow read active services to everyone"
  on public.services for select
  using (active = true or public.get_my_role() in ('admin', 'editor'));

create policy "Allow insert services to editors and admins"
  on public.services for insert
  to authenticated
  with check (public.get_my_role() in ('admin', 'editor'));

create policy "Allow update services to editors and admins"
  on public.services for update
  to authenticated
  using (public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete services to admins only"
  on public.services for delete
  to authenticated
  using (public.get_my_role() = 'admin');

-- --- SERVICE IMAGES POLICIES ---
create policy "Allow read service images to everyone"
  on public.service_images for select
  using (exists (
    select 1 from public.services s
    where s.id = service_id and (s.active = true or public.get_my_role() in ('admin', 'editor'))
  ));

create policy "Allow insert service images to editors and admins"
  on public.service_images for insert
  to authenticated
  with check (public.get_my_role() in ('admin', 'editor'));

create policy "Allow update service images to editors and admins"
  on public.service_images for update
  to authenticated
  using (public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete service images to admins only"
  on public.service_images for delete
  to authenticated
  using (public.get_my_role() = 'admin');

-- --- PROJECTS POLICIES ---
create policy "Allow read active projects to everyone"
  on public.projects for select
  using (active = true or public.get_my_role() in ('admin', 'editor'));

create policy "Allow insert projects to editors and admins"
  on public.projects for insert
  to authenticated
  with check (public.get_my_role() in ('admin', 'editor'));

create policy "Allow update projects to editors and admins"
  on public.projects for update
  to authenticated
  using (public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete projects to admins only"
  on public.projects for delete
  to authenticated
  using (public.get_my_role() = 'admin');

-- --- PROJECT IMAGES POLICIES ---
create policy "Allow read project images to everyone"
  on public.project_images for select
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and (p.active = true or public.get_my_role() in ('admin', 'editor'))
  ));

create policy "Allow insert project images to editors and admins"
  on public.project_images for insert
  to authenticated
  with check (public.get_my_role() in ('admin', 'editor'));

create policy "Allow update project images to editors and admins"
  on public.project_images for update
  to authenticated
  using (public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete project images to admins only"
  on public.project_images for delete
  to authenticated
  using (public.get_my_role() = 'admin');

-- --- REVIEWS POLICIES ---
create policy "Allow read approved reviews to everyone"
  on public.reviews for select
  using (status = 'approved' or public.get_my_role() in ('admin', 'editor'));

create policy "Allow insert reviews to everyone"
  on public.reviews for insert
  with check (true); -- Visitors submit reviews

create policy "Allow update reviews to editors and admins"
  on public.reviews for update
  to authenticated
  using (public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete reviews to admins only"
  on public.reviews for delete
  to authenticated
  using (public.get_my_role() = 'admin');

-- --- REVIEW MEDIA POLICIES ---
create policy "Allow read approved review media to everyone"
  on public.review_media for select
  using (exists (
    select 1 from public.reviews r
    where r.id = review_id and (r.status = 'approved' or public.get_my_role() in ('admin', 'editor'))
  ));

create policy "Allow insert review media to everyone"
  on public.review_media for insert
  with check (true); -- Visitors upload files linked to reviews

create policy "Allow delete review media to admins only"
  on public.review_media for delete
  to authenticated
  using (public.get_my_role() = 'admin');


-- =========================================================================
-- 4. BUCKET CONFIGURATIONS & STORAGE POLICIES
-- =========================================================================

-- Note: These queries insert buckets directly if permissions allow.
-- If running from a SQL Console with proper rights, this will configure buckets.
insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('review-media', 'review-media', true)
on conflict (id) do nothing;

-- Storage Policies can be created directly by postgres role

-- Clean existing storage policies
drop policy if exists "Allow public read from service-images" on storage.objects;
drop policy if exists "Allow upload to service-images for editors and admins" on storage.objects;
drop policy if exists "Allow delete service-images for admins only" on storage.objects;

drop policy if exists "Allow public read from project-images" on storage.objects;
drop policy if exists "Allow upload to project-images for editors and admins" on storage.objects;
drop policy if exists "Allow delete project-images for admins only" on storage.objects;

drop policy if exists "Allow public read from review-media" on storage.objects;
drop policy if exists "Allow public upload to review-media" on storage.objects;
drop policy if exists "Allow delete review-media for admins only" on storage.objects;

-- Storage Policies for service-images
create policy "Allow public read from service-images"
  on storage.objects for select
  using (bucket_id = 'service-images');

create policy "Allow upload to service-images for editors and admins"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'service-images' and public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete service-images for admins only"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'service-images' and public.get_my_role() = 'admin');

-- Storage Policies for project-images
create policy "Allow public read from project-images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Allow upload to project-images for editors and admins"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images' and public.get_my_role() in ('admin', 'editor'));

create policy "Allow delete project-images for admins only"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images' and public.get_my_role() = 'admin');

-- Storage Policies for review-media
create policy "Allow public read from review-media"
  on storage.objects for select
  using (bucket_id = 'review-media');

-- Visitors need to insert review media
create policy "Allow public upload to review-media"
  on storage.objects for insert
  with check (bucket_id = 'review-media');

create policy "Allow delete review-media for admins only"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'review-media' and public.get_my_role() = 'admin');
