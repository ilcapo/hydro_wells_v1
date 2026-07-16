# Análisis de Funcionalidades y Recomendaciones de Mejora - HydroWells V2

Este documento contiene un desglose completo al 100% de las funcionalidades del sistema **HydroWells V2** (sitio corporativo y sistema de administración de contenidos - CMS), su arquitectura técnica y una serie de recomendaciones y mejoras de seguridad, rendimiento y experiencia de usuario.

---

## 1. Arquitectura Tecnológica del Proyecto

El proyecto está construido con un stack moderno y eficiente:
- **Framework**: [Next.js](file:///c:/wamp64/www/hydro_wells_v2/package.json) (versión 14+) utilizando el **App Router** (`/app`) y soporte para renderizado en servidor (SSR/ISR) y cliente (CSR).
- **Estilos**: Tailwind CSS con un sistema de diseño premium, bordes redondeados amplios, degradados oscuros, efectos de vidrio templado (*glassmorphism*) y animaciones fluidas con **Framer Motion**.
- **Iconografía**: [Lucide React](file:///c:/wamp64/www/hydro_wells_v2/package.json).
- **Base de Datos y Autenticación**: Supabase (PostgreSQL) con políticas de seguridad de nivel de fila (RLS).
- **Almacenamiento de Archivos**: Supabase Storage Buckets para banners de servicios, imágenes de proyectos y evidencias adjuntas por clientes.

---

## 2. Mapa Completo de Funcionalidades (100%)

### A. Portal Público (Frontend)
El portal público está diseñado para enganchar al cliente residencial y comercial en Maryland y Washington DC, facilitando la conversión rápida para servicios programados y de emergencia.

1. **Página Principal de Aterrizaje (`app/page.tsx`)**:
   - **Header Dinámico**: Logotipo, aviso de servicio 24/7 y botón de llamada rápida (`301-393-7090`).
   - **Sección Hero**: Mensaje de ingeniería moderna de agua, enlace rápido a cotización y catálogo.
   - **Métricas de Confianza**: Tarjetas que destacan "100% Satisfacción", "Soporte 24/7" y "Equipo Licenciado".
   - **Catálogo Dinámico de Servicios**: Muestra las tarjetas de servicios marcados como activos (`active = true`) y destacados en la base de datos. Si no hay conexión o datos en Supabase, cuenta con un sistema de *fallback* estático ([Water Well Drilling](file:///c:/wamp64/www/hydro_wells_v2/app/water-well-drilling/page.tsx), [Pump Service](file:///c:/wamp64/www/hydro_wells_v2/app/pump-service/page.tsx), [Constant Pressure](file:///c:/wamp64/www/hydro_wells_v2/app/constant-pressure/page.tsx)).
   - **Sección "Cómo Trabajamos"**: Flujo visual en tres pasos (Contacto -> Evaluación Técnica -> Solución Entregada) con animaciones hover 3D.
   - **Casos de Éxito Dinámicos**: Carrusel/tarjetas con los últimos 3 proyectos activos completados (`projects` en DB), mostrando imagen destacada, ubicación y fecha de finalización.
   - **Sección de Testimonios**: Muestra comentarios calificados de clientes reales que han sido previamente moderados y aprobados por los administradores.
   - **Sección FAQ**: Acordeones interactivos con preguntas frecuentes sobre mantenimiento, presión de agua y costos de pozos.
   - **Formulario de Cotización**: Captura nombre, email, tipo de servicio y descripción del problema.
   - **Footer de Confianza**: Enlaces rápidos, páginas estáticas de servicios y datos de contacto de la sede central física en Dickerson, MD.

2. **Detalle de Servicios (`app/services/[slug]/page.tsx`)**:
   - **SEO Dinámico**: Genera etiquetas de título, descripción e imágenes de OpenGraph según el servicio consultado.
   - **Información Detallada**: Nombre, descripción corta y texto completo de la intervención.
   - **Datos Estructurados (SEO Avanzado)**: Inyección automática de JSON-LD (`Schema.org` de tipo `Service` y `LocalBusiness`) para mejorar la indexación local en buscadores.
   - **Galería Multimedia**: Mosaico con las imágenes técnicas asociadas al servicio (`service_images`), ordenadas dinámicamente.
   - **Listado de Reseñas de Clientes**: Comentarios específicos del servicio con estrellas de puntuación y visualización de archivos adjuntos de evidencia (imágenes/videos) subidos por los clientes.
   - **Formulario de Reseña Integrado (`components/ReviewForm.tsx`)**: Permite a los clientes enviar calificaciones de 1 a 5 estrellas, comentarios y adjuntar hasta 3 fotos o videos como evidencia de la obra.

3. **Detalle de Casos de Éxito / Proyectos (`app/projects/[slug]/page.tsx`)**:
   - **SEO de Proyecto**: Títulos y metadescripciones personalizadas según la obra.
   - **Ficha Técnica**: Título, ubicación de la obra (ej. ciudad de Maryland), fecha de finalización y descripción del desafío resuelto.
   - **Datos Estructurados**: JSON-LD de tipo `CreativeWork` para indexación de trabajos y portafolios.
   - **Galería de Evidencias**: Panel interactivo con fotos del antes/después y detalles técnicos del proyecto.

---

### B. Panel de Administración / CMS (`app/admin`)
El sistema cuenta con un panel privado para que el personal autorizado edite el contenido web sin tocar código.

1. **Sistema de Seguridad y Roles (`middleware.ts` y `profiles` table)**:
   - **Protección de Rutas**: El middleware de Next.js intercepta cualquier petición a `/admin` (excepto `/admin/login`) y verifica si hay una sesión activa.
   - **Verificación de Rol**: Verifica el rol del usuario en la tabla `profiles` de Supabase. Solo permite el acceso si el rol es `admin` o `editor`.
   - **Bootstrap de Cuenta**: Si la base de datos no tiene perfiles registrados, el primer usuario que se registre a través del formulario de Sign Up se convierte automáticamente en `admin`. Los usuarios posteriores se registrarán como `editor` por defecto.

2. **Dashboard Principal (`app/admin/page.tsx`)**:
   - **Tarjetas KPI**: Cantidad de servicios registrados, casos de éxito publicados, cantidad de comentarios pendientes de moderación y valoración media (estrellas) de la empresa.
   - **Cola de Moderación Rápida**: Muestra los últimos 5 comentarios recibidos en estado "pendiente". Permite a los administradores aprobarlos (se publican al instante) o rechazarlos con un clic.
   - **Accesos Rápidos**: Botones para crear un servicio, registrar un proyecto, administrar categorías y un recordatorio visual de las reglas de seguridad de roles.

3. **Administración de Categorías (`app/admin/categories/page.tsx`)**:
   - Formulario único para crear y editar categorías de servicios (Nombre, generación automática de slug de URL y descripción).
   - Tabla interactiva con opción de edición rápida en línea.
   - **Permisos**: Tanto administradores como editores pueden crear y actualizar. Solo los usuarios con rol `admin` pueden eliminar categorías.

4. **Administración de Servicios (`app/admin/services`)**:
   - **Listado de Servicios (`page.tsx`)**: Muestra tarjetas con la imagen principal, categoría, slug, descripción corta y el estado de visibilidad (activo/inactivo y destacado/común).
   - **Crear Servicio (`new/page.tsx`)**: Formulario completo para registrar el servicio, seleccionar su categoría, redactar descripciones y definir parámetros SEO (Meta Title y Meta Description).
   - **Editar Servicio (`[id]/edit/page.tsx`)**:
     - Modificación de toda la información principal y configuración SEO.
     - **Gestor de Banner Principal**: Permite subir y reemplazar la imagen de cabecera directamente al bucket `service-images` de Supabase Storage.
     - **Galería Multimedia Avanzada**:
       - Carga múltiple de imágenes de alta resolución.
       - Reorganización de imágenes mediante botones de orden (`sort_order`).
       - Opción para establecer cualquier imagen de la galería como el banner principal del servicio.
       - Eliminación física del archivo en Supabase Storage y del registro en la base de datos (restringido a `admin`).

5. **Administración de Casos de Éxito / Proyectos (`app/admin/projects`)**:
   - **Listado y Búsqueda**: Muestra proyectos documentados, su ubicación y fecha de término.
   - **Editor Completo**: Registro y edición de títulos, descripciones técnicas, geolocalización, carga de banners y de galerías de fotos del proyecto.
   - **Control de Borradores**: Opción para publicar o guardar como borrador (`active: false`) para revisión interna.

6. **Administración y Moderación de Reseñas (`app/admin/reviews/page.tsx`)**:
   - Filtro por pestañas: Pendientes, Aprobados, Rechazados y Todos.
   - Detalle de la reseña: Nombre, email, comentario, servicio al que pertenece, calificación y fecha.
   - **Visor de Evidencia de Clientes**: Muestra fotos y videos subidos por el cliente. Las imágenes se previsualizan en miniatura y los videos cuentan con un reproductor interactivo para revisión previa a la publicación.
   - **Acciones**: Aprobar (pasa a visible en el frontend), Rechazar o Eliminar permanentemente (restringido a `admin`).

---

## 3. Modelo de Datos y Seguridad (Supabase SQL)

El archivo [`supabase_schema.sql`](file:///c:/wamp64/www/hydro_wells_v2/supabase_schema.sql) configura de manera estricta la base de datos PostgreSQL:

### Tablas Principales
- `profiles`: Vinculada a `auth.users`. Almacena el correo electrónico y el rol (`admin` / `editor`).
- `service_categories`: Categorías de clasificación.
- `services`: Servicios técnicos de agua con campos de SEO.
- `service_images`: Galería multimedia de servicios con ordenamiento numérico.
- `projects`: Casos de éxito y portafolio de obras.
- `project_images`: Fotos técnicas de soporte de los proyectos.
- `reviews`: Valoraciones de los usuarios con estados (`pending`, `approved`, `rejected`).
- `review_media`: URLs de fotos y videos cargados por visitantes como prueba del servicio.

### Políticas de Seguridad RLS (Row Level Security)
- **Lectura Pública**: Cualquier usuario (visitante anónimo) puede leer categorías, servicios activos, proyectos activos, imágenes de servicios/proyectos activos, y comentarios aprobados con su respectivo contenido multimedia.
- **Inserción Pública (Visitantes)**: Los visitantes anónimos tienen permitido insertar registros en `reviews` y subir archivos a `review_media` para poder dejar su testimonio.
- **Gestión (Editores y Admins)**: Los usuarios autenticados con rol `editor` o `admin` pueden insertar y actualizar categorías, servicios, proyectos e imágenes.
- **Destrucción de Datos**: Únicamente los usuarios autenticados con rol `admin` tienen permiso para ejecutar comandos `DELETE` en cualquiera de las tablas y buckets de almacenamiento.

---

## 4. Recomendaciones de Seguridad y Estabilidad

Al auditar a fondo el código y la base de datos, se identificaron los siguientes puntos críticos que requieren atención:

### ⚠️ Inconsistencia en la Política de Moderación de Reseñas (RLS vs Frontend)
* **Situación actual**: En el código frontend de Next.js (`app/admin/page.tsx` y `app/admin/reviews/page.tsx`), los botones de moderación (Aprobar/Rechazar) están deshabilitados o protegidos si el usuario tiene el rol `editor`. Sin embargo, la política RLS en PostgreSQL dice:
  ```sql
  create policy "Allow update reviews to editors and admins"
    on public.reviews for update
    to authenticated
    using (public.get_my_role() in ('admin', 'editor'));
  ```
* **Riesgo**: Un usuario con rol `editor` malicioso o comprometido podría saltarse el frontend y enviar una petición directa a Supabase utilizando la API Key pública para aprobar comentarios sin autorización del administrador.
* **Solución**: Ajustar la política RLS para restringir la modificación del campo `status` de la tabla `reviews` únicamente a administradores:
  ```sql
  -- Cambiar política para que solo 'admin' pueda actualizar el estado
  create policy "Allow update reviews to admins only"
    on public.reviews for update
    to authenticated
    using (public.get_my_role() = 'admin');
  ```

### ⚠️ Archivos Huérfanos en Supabase Storage
* **Situación actual**: Cuando se elimina un servicio, un proyecto o una imagen de la galería, se ejecuta un borrado en cascada en la base de datos (ej. se borra el registro en la tabla `service_images` o `project_images`). Sin embargo, Supabase Database **no elimina físicamente** los archivos asociados dentro del Storage Bucket (`service-images` o `project-images`).
* **Riesgo**: Acumulación progresiva de basura y archivos huérfanos que consumen espacio en disco y aumentan los costos de almacenamiento.
* **Solución**: Implementar un trigger en PostgreSQL que invoque un webhook/Edge Function al borrar un registro, o asegurarse de que las llamadas de borrado en el servidor de Next.js limpien los archivos en `supabase.storage.from(...).remove(...)` antes de confirmar la eliminación en la base de datos.

### ⚠️ Carga Libre de Archivos en el Bucket de Evidencias (`review-media`)
* **Situación actual**: Los visitantes del sitio pueden subir fotos y videos adjuntos a sus reseñas. La política de almacenamiento dice:
  ```sql
  create policy "Allow public upload to review-media"
    on storage.objects for insert
    with check (bucket_id = 'review-media');
  ```
* **Riesgo**: Un usuario malicioso podría utilizar este endpoint abierto para subir gigabytes de archivos basura, videos extremadamente pesados, scripts ejecutables camuflados o contenido inapropiado, saturando el almacenamiento.
* **Solución**:
  1. Limitar el tamaño máximo de archivo directamente en la política de Supabase (ej. máx 5MB para imágenes y 20MB para videos).
  2. Restringir los tipos MIME permitidos en el bucket para admitir únicamente extensiones comunes como `image/jpeg`, `image/png`, `video/mp4` y `video/quicktime`.

### ⚠️ Manejo de Colisiones en Slugs Únicos
* **Situación actual**: El CMS genera automáticamente el slug de URL basado en el nombre del servicio o proyecto introducido por el usuario. En la base de datos, la columna `slug` tiene una restricción de unicidad (`unique`).
* **Riesgo**: Si un editor registra dos proyectos o servicios con nombres similares que generen el mismo slug, el sistema lanzará un error interno de base de datos no controlado en la interfaz de usuario.
* **Solución**: Agregar una función de validación en el servidor que verifique si el slug ya existe antes de realizar la inserción y, de ser así, añada automáticamente un sufijo numérico (ej. `reparacion-de-bomba-1`, `reparacion-de-bomba-2`).

---

## 5. Propuestas de Mejora de Rendimiento y UX

### 🚀 Optimización de Carga y SEO en la Home (`app/page.tsx`)
* **Situación actual**: La página de inicio está marcada con `'use client'` y realiza la carga de los servicios dinámicos, proyectos y reseñas en el navegador a través de un hook `useEffect`. Esto perjudica el SEO, ya que los motores de búsqueda reciben una página vacía o con datos estáticos de respaldo (*fallbacks*) en el primer render.
* **Solución**: Convertir la página principal en un **Server Component** (removiendo `'use client'` de la cabecera). Realizar las consultas a Supabase de manera directa en el servidor y pasar los datos a componentes hijos interactivos (como el carrusel de testimonios o el formulario de contacto que sí requieran estado del cliente). Esto acelerará el First Contentful Paint (FCP) y garantizará que Google indexe los servicios dinámicos reales al 100%.

### 📧 Sistema de Notificaciones por Correo Electrónico
* **Situación actual**: Cuando un cliente llena el formulario de contacto o envía una reseña para moderar, los datos simplemente quedan guardados de manera silenciosa en la base de datos. Los administradores deben ingresar periódicamente al panel para enterarse de que hay nuevos mensajes.
* **Solución**: Integrar un proveedor de envíos de correo como **Resend** o **SendGrid** mediante una Next.js API Route o Server Action. Cada vez que se envíe un formulario de contacto o una nueva reseña, se disparará una notificación automática al correo de la administración de HydroWells, permitiendo una respuesta inmediata ante emergencias de pozos.

### 🌐 Consistencia de Idioma (Localización)
* **Situación actual**: El portal público utiliza textos informativos y títulos en inglés (ej. *"Ready to solve your water emergency"*, *"Immediate emergency"*), mientras que el CMS de administración y varias vistas de detalle dinámicas emplean español (*"Resumen General"*, *"Casos de Éxito"*, *"Comentarios"*).
* **Solución**: Unificar el idioma de cara al público principal. Dado que la empresa opera en Maryland y Washington DC, el portal público debería ser 100% en inglés con opción de traducción, o estar completamente traducido al inglés incluyendo los placeholders y las respuestas automáticas de los formularios.

### 🔍 Auditoría de Imágenes Subidas por CMS
* **Situación actual**: El CMS permite subir cualquier imagen como banner de servicio o proyecto. Si los usuarios suben imágenes directamente tomadas con teléfonos móviles (que suelen pesar entre 5MB y 12MB en formatos sin comprimir), el rendimiento del sitio se degradará drásticamente.
* **Solución**: Implementar una librería de compresión en el cliente (como `browser-image-compression`) o un procesamiento en el servidor antes de subir la imagen a Supabase, forzando la conversión a formatos modernos de alto rendimiento como **WebP** y limitando la resolución máxima a 1920px de ancho.
