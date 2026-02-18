// ============================================================================
// ENTIDADES - PERSONAL (Consumo desde MS Personal)
// ============================================================================

export interface Personal {
  id: string;
  dni: string;
  nombres: string;
  ap_paterno: string;
  ap_materno: string;
  ruc?: string;
  fecha_nacimiento?: Date;
  genero?: string;
  celular?: string;
  correo_personal?: string;
  correo_corporativo?: string;
  fecha_vencimiento_dni?: Date;
  direccion?: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  fecha_registro?: Date;
  fecha_ingreso?: Date;
  empresa_id?: string;
  estado?: boolean;
  carrera?: string;
  formacion?: string;
  situacion_permanencia?: string;
  alta_t_registro?: string;
  estado_civil?: string;
  observaciones?: string;
  empleabilidad_id?: string;
  disponibilidad?: boolean;
  cargo_categoria_especialidad_id?: string;
  empleabilidades: Empleabilidad[];
  foto_perfil?: ArchivoSustento;
  estado_documento?: string;
  plantilla_id?: string;
  jefe_inmediato_id?: string;
  pension_tipo?: string;
  pension_tipo_comision?: string;
  pension_tipo_fecha_inicio?: Date;
  pension_tipo_fecha_fin?: Date;
  tipo_empleado?: string;
  usuario_id?: string;
  usuario_creacion?: UsuarioCreador;
  jefe_inmediato?: Personal;
  historial_pension: HistorialPensionEmpleadoCH[];
  fecha_ingreso_personal?: Date;
  fecha_salida_personal?: Date;
}

export interface Empleabilidad {
  id: string;
  empleadoch_id: string;
  obra_id: string;
  fecha_ingreso: Date;
  fecha_baja?: Date;
  estado: string;
  cargo_categoria_especialidad_id: string;
  observaciones?: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  obra?: Obra;
  movilidad?: Movilidad;
}

export interface ArchivoSustento {
  id: string;
  url: string;
  referencia_id: string;
  tipo: string;
  nombre_archivo?: string;
  tamano_archivo?: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  tipo_mime?: string;
  estado: string;
}

export interface UsuarioCreador {
  id: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  usuario: string;
}

export interface HistorialPensionEmpleadoCH {
  id: string;
  empleadoch_id: string;
  pension_tipo_anterior?: string;
  pension_tipo_nuevo?: string;
  pension_tipo_comision_anterior?: string;
  pension_tipo_comision_nuevo?: string;
  pension_tipo_fecha_inicio_anterior?: Date;
  pension_tipo_fecha_inicio_nuevo?: Date;
  pension_tipo_fecha_fin_anterior?: Date;
  pension_tipo_fecha_fin_nuevo?: Date;
  usuario_id: string;
  fecha_creacion: Date;
}

export interface Obra {
  id: string;
  titulo: string;
  nombre: string;
  descripcion?: string;
}

export interface Movilidad {
  id: string;
  empleabilidad_id: string;
  estado: string;
  obra_id: string;
  motivo: string;
  observacion?: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface CargoCategoriaEspecialidad {
  id: string;
  cargo: string;
  categoria: string;
  especialidad: string;
}

// Interfaces para filtros y respuestas de paginación
export interface PersonalFilterInput {
  ids?: string[];
  search?: string;
  disponibilidad?: boolean;
  empleabilidad_id?: string;
  actualizado_despues_de?: Date;
}

export interface PersonalReferenciasInput {
  conFotoPerfil?: boolean;
  conEmpleabilidadActual?: boolean;
  conEmpleabilidadActualMovilidad?: boolean;
}

export interface PersonalPaginadoResult {
  data: Personal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}