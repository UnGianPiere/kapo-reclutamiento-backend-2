// ============================================================================
// ENTIDAD COMUNICACION ENTRADA - Confirmaciones para comunicar entrada
// ============================================================================

export interface ComunicacionEntrada {
  id: string;
  aplicacionCandidatoId: string;
  candidatoId: string;
  llamadaConfirmada: boolean;
  comunicacionConfirmada: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// INPUTS PARA OPERACIONES CRUD
// ============================================================================

export interface CrearComunicacionEntradaInput {
  aplicacionCandidatoId: string;
  candidatoId: string;
  llamadaConfirmada: boolean;
  comunicacionConfirmada: boolean;
}

export interface ActualizarComunicacionEntradaInput {
  llamadaConfirmada?: boolean;
  comunicacionConfirmada?: boolean;
}
