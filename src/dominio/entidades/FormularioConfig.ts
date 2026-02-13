// ============================================================================
// ENTIDAD FORMULARIO CONFIG - Configuración personalizable de formularios
// ============================================================================

export type TipoCampoFormulario = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'url' | 'file' | 'checkbox';
export type EstadoFormularioConfig = 'ACTIVO' | 'INACTIVO';

export interface ICampoFormulario {
  id: string;
  nombre: string;
  etiqueta: string;
  tipo: TipoCampoFormulario;
  requerido: boolean;
  habilitado: boolean;
  orden: number;
  opciones?: string[];
  placeholder?: string;
  validaciones?: {
    min?: number;
    max?: number;
    patron?: string;
    maxSize?: number;
    maxFiles?: number;
    maxTamanoArchivo?: number;
    maxLength?: number;
    allowedTypes?: string[];
  };
}

export interface FormularioConfig {
  id: string;
  convocatoriaId: string;
  titulo: string;
  descripcion?: string;
  campos: ICampoFormulario[];
  estado: EstadoFormularioConfig;

  // Link público y autenticación
  urlPublico?: string;
  tokenJwt?: string;

  // Fechas de vigencia automática
  fechaPublicacion?: Date;
  fechaExpiracion?: Date;

  creadoPor: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  version: number;
}

export interface CrearFormularioConfigInput {
  convocatoriaId: string;
  titulo?: string;
  descripcion?: string;
  campos?: ICampoFormulario[];
  estado?: EstadoFormularioConfig;
  urlPublico?: string;
  tokenJwt?: string;
  fechaPublicacion?: Date;
  fechaExpiracion?: Date;
  creadoPor?: string;
}

export interface ActualizarFormularioConfigInput {
  titulo?: string;
  descripcion?: string;
  campos?: ICampoFormulario[];
  estado?: EstadoFormularioConfig;
  urlPublico?: string;
  tokenJwt?: string;
  fechaPublicacion?: Date;
  fechaExpiracion?: Date;
}

export interface CampoFormularioInput {
  id?: string;
  nombre: string;
  etiqueta: string;
  tipo: TipoCampoFormulario;
  requerido?: boolean;
  habilitado?: boolean;
  orden: number;
  opciones?: string[];
  placeholder?: string;
  validaciones?: {
    min?: number;
    max?: number;
    patron?: string;
    maxSize?: number;
    maxFiles?: number;
    maxTamanoArchivo?: number;
    maxLength?: number;
    allowedTypes?: string[];
  };
}

// Campos requeridos que siempre estarán presentes
export const CAMPOS_REQUERIDOS_BASE: ICampoFormulario[] = [
  {
    id: 'dni',
    nombre: 'dni',
    etiqueta: 'DNI',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 1,
    placeholder: 'Ingrese su número de DNI',
    validaciones: {
      patron: '^\\d{8}$',
      maxLength: 8
    }
  },
  {
    id: 'nombres',
    nombre: 'nombres',
    etiqueta: 'NOMBRES',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 2,
    placeholder: 'Ingrese sus nombres completos'
  },
  {
    id: 'apellido_paterno',
    nombre: 'apellido_paterno',
    etiqueta: 'APELLIDO PATERNO',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 3,
    placeholder: 'Ingrese su apellido paterno'
  },
  {
    id: 'apellido_materno',
    nombre: 'apellido_materno',
    etiqueta: 'APELLIDO MATERNO',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 4,
    placeholder: 'Ingrese su apellido materno'
  },
  {
    id: 'correo',
    nombre: 'correo',
    etiqueta: 'CORREO ELECTRÓNICO',
    tipo: 'email',
    requerido: true,
    habilitado: true,
    orden: 5,
    placeholder: 'correo@ejemplo.com'
  },
  {
    id: 'telefono',
    nombre: 'telefono',
    etiqueta: 'TELÉFONO',
    tipo: 'tel',
    requerido: true,
    habilitado: true,
    orden: 6,
    placeholder: '+51 XXX XXX XXX'
  },
  {
    id: 'medio_convocatoria',
    nombre: 'medio_convocatoria',
    etiqueta: 'POR QUE MEDIO SE ENTERO DE LA CONVOCATORIA',
    tipo: 'select',
    requerido: true,
    habilitado: true,
    orden: 7,
    opciones: [
      'Redes Sociales',
      'Sitio Web de la Empresa',
      'Referencia de un conocido',
      'Bolsa de trabajo',
      'LinkedIn',
      'Otro'
    ]
  },
  {
    id: 'anios_experiencia_puesto',
    nombre: 'anios_experiencia_puesto',
    etiqueta: 'AÑOS DE EXPERIENCIA EN EL PUESTO',
    tipo: 'number',
    requerido: true,
    habilitado: true,
    orden: 8,
    validaciones: { min: 0, max: 50 }
  },
  {
    id: 'anios_experiencia_general',
    nombre: 'anios_experiencia_general',
    etiqueta: 'AÑOS DE EXPERIENCIA PROFESIONAL GRAL.',
    tipo: 'number',
    requerido: true,
    habilitado: true,
    orden: 9,
    validaciones: { min: 0, max: 50 }
  },
  {
    id: 'pretension_economica',
    nombre: 'pretension_economica',
    etiqueta: 'PRETENSIÓN ECONÓMICA',
    tipo: 'number',
    requerido: true,
    habilitado: true,
    orden: 10,
    validaciones: { min: 0 },
    placeholder: 'S/ 0.00'
  },
  {
    id: 'lugar_residencia',
    nombre: 'lugar_residencia',
    etiqueta: 'LUGAR DE RESIDENCIA',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 11,
    placeholder: 'Ciudad, Provincia'
  },
  {
    id: 'curriculum',
    nombre: 'curriculum',
    etiqueta: 'CURRICULUM',
    tipo: 'file',
    requerido: true,
    habilitado: true,
    orden: 12,
    validaciones: {
      maxSize: 5242880, // 5MB en bytes
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  },
  {
    id: 'terminos_aceptados',
    nombre: 'terminos_aceptados',
    etiqueta: 'ACEPTO LOS TÉRMINOS DE USO',
    tipo: 'checkbox',
    requerido: true,
    habilitado: true,
    orden: 13
  }
];