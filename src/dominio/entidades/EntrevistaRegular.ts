// ============================================================================
// ENTIDAD ENTREVISTA REGULAR - Registro de entrevistas presenciales/virtual (primera/segunda)
// ============================================================================

export type TipoEntrevista = 'PRIMERA' | 'SEGUNDA';

export interface EntrevistaRegular {
  id: string;

  /** ID de la aplicación candidata relacionada */
  aplicacionCandidatoId: string;

  /** ID del candidato (referencia directa) */
  candidatoId: string;

  /** Tipo de entrevista */
  tipo_entrevista: TipoEntrevista;

  /** Información de la entrevista */
  fecha_entrevista: Date;
  hora_entrevista: string;
  correo_contacto?: string;

  /** Información del entrevistador */
  entrevistador_id: string;
  entrevistador_nombre: string;

  /** Observaciones adicionales */
  observaciones?: string;

  /** Resultado de la entrevista */
  resultado?: string;

  /** Metadata */
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// INPUTS PARA OPERACIONES CRUD
// ============================================================================

export interface CrearEntrevistaRegularInput {
  aplicacionCandidatoId: string;
  candidatoId: string;
  tipo_entrevista: TipoEntrevista;
  fecha_entrevista: Date;
  hora_entrevista: string;
  correo_contacto?: string;
  entrevistador_id: string;
  entrevistador_nombre: string;
  observaciones?: string;
  resultado?: string;
}

export interface ActualizarEntrevistaRegularInput {
  fecha_entrevista?: Date;
  hora_entrevista?: string;
  correo_contacto?: string;
  entrevistador_id?: string;
  entrevistador_nombre?: string;
  observaciones?: string;
  resultado?: string;
}