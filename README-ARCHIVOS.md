# 📁 Configuración de Subida de Archivos - KAPO Reclutamiento

## 🚀 Servicio Reutilizable de Archivos

Se ha implementado un servicio reutilizable `FileUploadService` basado en la configuración del proyecto MONOLITO, adaptado para ser usado por cualquier servicio de tu aplicación de reclutamiento.

## 📦 Dependencias Agregadas

```json
{
  "@google-cloud/storage": "^7.19.0",
  "sharp": "^0.33.5"
}
```

Y sus tipos de desarrollo:
```json
{
  "@types/sharp": "^0.32.0"
}
```

## ⚙️ Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# Google Cloud Storage para archivos
GOOGLE_CLOUD_PROJECT_ID=tu-project-id-gcp
GOOGLE_CLOUD_BUCKET=reclutamiento-archivos
GOOGLE_CLOUD_KEY_FILE=./src/infraestructura/config/gcp-key.json
```

## 🔑 Configuración de Google Cloud

### 1. Crear Proyecto en GCP
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente

### 2. Habilitar APIs
- Cloud Storage API
- Cloud Storage JSON API

### 3. Crear Bucket
1. Ve a Cloud Storage > Buckets
2. Crea un bucket con nombre `reclutamiento-archivos`
3. Configuración recomendada:
   - Región: `us-central1` o la más cercana a tus usuarios
   - Control de acceso: `Uniforme`
   - Clase de almacenamiento: `Standard`

### 4. Crear Service Account
1. Ve a IAM > Service Accounts
2. Crea una nueva cuenta de servicio
3. Otorga el rol `Storage Object Admin`
4. Crea y descarga la clave JSON
5. Coloca el archivo en `src/infraestructura/config/gcp-key.json`

## 📂 Estructura de Archivos

```
📁 src/
├── 📁 aplicacion/servicios/
│   └── 📄 FileUploadService.ts          ← SERVICIO PRINCIPAL
├── 📁 infraestructura/
│   ├── 📁 graphql/types/
│   │   └── 📄 upload.type.ts            ← TIPOS GRAPHQL
│   ├── 📁 config/
│   │   ├── 📄 googleCloudStorage.ts     ← CONFIG GCP (EXISTENTE)
│   │   └── 📄 gcp-key.json              ← CREDENCIALES GCP
│   └── 📁 graphql/schemas/
│       └── 📄 [schema-archivos].graphql ← SCHEMA ACTUALIZADO
```

## 🛠️ Cómo Usar el Servicio

### En Cualquier Servicio

```typescript
import { FileUploadService } from '../FileUploadService';

// Subir fotos de candidatos
const resultado = await FileUploadService.uploadMultipleGraphQLFiles(
  archivosGraphQL,
  FileUploadService.FOTOS_CANDIDATO_CONFIG
);

// Subir CVs y documentos
const documentos = await FileUploadService.uploadMultipleGraphQLFiles(
  archivosDocumento,
  FileUploadService.CV_DOCUMENTOS_CONFIG
);

// Subir evidencias de entrevistas
const evidencias = await FileUploadService.uploadMultipleGraphQLFiles(
  archivosEvidencia,
  FileUploadService.EVIDENCIAS_ENTREVISTA_CONFIG
);
```

### Configuraciones Predefinidas

```typescript
// Para fotos de candidatos
FileUploadService.FOTOS_CANDIDATO_CONFIG = {
  folder: "fotos-candidatos",
  maxFileSize: 3MB,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  optimizeImages: true,
  generateUniqueNames: true
}

// Para CVs y documentos
FileUploadService.CV_DOCUMENTOS_CONFIG = {
  folder: "cv-documentos",
  maxFileSize: 15MB,
  allowedMimeTypes: ["application/pdf", "application/msword", ...],
  optimizeImages: false,
  generateUniqueNames: true
}

// Para evidencias de entrevistas
FileUploadService.EVIDENCIAS_ENTREVISTA_CONFIG = {
  folder: "evidencias-entrevistas",
  maxFileSize: 10MB,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  optimizeImages: true,
  generateUniqueNames: true
}

// Para documentos de convocatorias
FileUploadService.DOCUMENTOS_CONVOCATORIA_CONFIG = {
  folder: "documentos-convocatorias",
  maxFileSize: 25MB,
  allowedMimeTypes: ["application/pdf", "application/msword", ...],
  optimizeImages: false,
  generateUniqueNames: true
}
```

## 🎯 Características del Servicio

### ✅ Optimización Automática
- **Imágenes**: Se convierten automáticamente a WebP para reducir tamaño
- **Calidad**: Mantiene proporción, máximo 1200px, calidad 85%
- **Rendimiento**: Procesamiento en lotes para conexiones móviles

### ✅ Validaciones
- **Tamaño máximo**: Configurable por tipo de archivo
- **Tipos MIME**: Solo tipos permitidos
- **Nombres únicos**: Evita conflictos con UUID

### ✅ Manejo de Errores
- **Archivos individuales**: Si uno falla, los demás continúan
- **Logging detallado**: Registra qué falló y por qué
- **Timeouts**: Configurables para diferentes entornos

### ✅ Integración GraphQL
- **Scalar Upload**: Soportado nativamente
- **Múltiples archivos**: Arrays de archivos
- **Validación**: Tanto del lado del servidor como cliente

## 🔄 Ejemplo de Uso en CandidatoService

```typescript
// En la interfaz
export interface CrearCandidatoDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  foto_perfil?: Upload[];           // ← Fotos opcionales
  cv_documento?: Upload[];           // ← CV opcional
}

// En el método crear
async crear(data: CrearCandidatoDto): Promise<Candidato> {
  // Subir foto de perfil si existe
  let fotoUrl: string | null = null;
  if (data.foto_perfil?.length) {
    const uploadResult = await FileUploadService.uploadMultipleGraphQLFiles(
      data.foto_perfil,
      FileUploadService.FOTOS_CANDIDATO_CONFIG
    );

    if (uploadResult.successful.length > 0) {
      fotoUrl = uploadResult.successful[0].url;
    }
  }

  // Subir CV si existe
  let cvUrl: string | null = null;
  if (data.cv_documento?.length) {
    const uploadResult = await FileUploadService.uploadMultipleGraphQLFiles(
      data.cv_documento,
      FileUploadService.CV_DOCUMENTOS_CONFIG
    );

    if (uploadResult.successful.length > 0) {
      cvUrl = uploadResult.successful[0].url;
    }
  }

  // Crear candidato con URLs de archivos subidos
  const candidato = new Candidato(
    data.nombre,
    data.apellido,
    data.email,
    data.telefono,
    fotoUrl,
    cvUrl
  );

  return await this.candidatoRepository.crear(candidato);
}
```

## 📊 Schema GraphQL Actualizado

```graphql
scalar Upload

extend type Mutation {
  createCandidato(
    nombre: String!
    apellido: String!
    email: String!
    telefono: String!
    foto_perfil: [Upload!]         # ← NUEVO
    cv_documento: [Upload!]        # ← NUEVO
  ): Candidato!

  updateCandidato(
    id: String!
    nombre: String
    apellido: String
    email: String
    telefono: String
    foto_perfil: [Upload!]         # ← NUEVO
    cv_documento: [Upload!]        # ← NUEVO
  ): Candidato!
}
```

## 🚀 Próximos Pasos

1. **Instalar dependencias**: `npm install`
2. **Configurar variables de entorno** (ver arriba)
3. **Configurar Google Cloud** (ver instrucciones arriba)
4. **Probar el servicio** con un candidato de prueba
5. **Extender a otros servicios** (EntrevistaService, ConvocatoriaService, etc.)

## 🔧 Expansión Futura

El servicio está diseñado para ser fácilmente extensible:

- **Nuevos tipos de archivo**: Solo agrega una nueva configuración
- **Diferentes buckets**: Configurable por tipo de archivo
- **CDN personalizado**: Fácil cambiar URLs de destino
- **Compresión adicional**: Agregar más formatos de optimización

## 📋 Carpetas en Google Cloud Storage

```
bucket/
├── fotos-candidatos/              # Fotos de perfil de candidatos
├── cv-documentos/                 # CVs y documentos de candidatos
├── evidencias-entrevistas/        # Evidencias de entrevistas
├── documentos-convocatorias/      # Documentos de convocatorias
└── imagenes-generales/           # Imágenes generales del sistema
```

¡El servicio está listo para usar en cualquier parte de tu aplicación de reclutamiento! 🎉
