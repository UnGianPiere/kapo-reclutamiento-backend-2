// ============================================================================
// ENTIDAD REFERENCIA - Registro de referencias laborales/personales del candidato
// ============================================================================

export interface Referencia {
  id: string;

  /** ID de la aplicación candidata relacionada */
  aplicacionCandidatoId: string;

  /** ID del candidato (referencia directa) */
  candidatoId: string;

  /** Información de la referencia */
  numero_telefono: string;
  nombresyapellidos: string;
  detalles?: string;
  empresa?: string;
  comentarios?: string;
  archivosurl?: any[];

  /** Metadata */
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// INPUTS PARA OPERACIONES CRUD
// ============================================================================

export interface CrearReferenciaInput {
  aplicacionCandidatoId: string;
  candidatoId: string;
  numero_telefono: string;
  nombresyapellidos: string;
  detalles?: string;
  empresa?: string;
  comentarios?: string;
  archivosurl?: any[];
}

export interface ActualizarReferenciaInput {
  numero_telefono?: string;
  nombresyapellidos?: string;
  detalles?: string;
  empresa?: string;
  comentarios?: string;
  archivosurl?: any[];
}