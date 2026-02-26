// ============================================================================
// ENTIDAD CANDIDATO - Información del postulante
// ============================================================================

export interface Candidato {
  id: string;
  /** Datos personales básicos - OBLIGATORIOS para MS PERSONAL */
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;

  /** Información adicional opcional */
  lugarResidencia?: string;

  /** URLs de documentos en Google Cloud Storage */
  curriculumUrl: string;

  /** Metadata */
  totalAplicaciones?: number;
  aplicacionesGanadas?: number;
  personal_id?: string;
  convocatorias_ganadas?: string[];
  fechaRegistro: Date;
  fechaActualizacion: Date;

  /** Auditoría de cambios */
  correosHistoricos: string[];
  telefonosHistoricos: string[];
}