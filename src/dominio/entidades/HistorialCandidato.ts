// ============================================================================
// ENTIDAD HISTORIAL CANDIDATO - Registro de todos los movimientos y cambios
// ============================================================================

import { EstadoKanban } from './EstadoKanban';

export type TipoCambioHistorial = 'APROBACION' | 'RECHAZO' | 'MOVIMIENTO' | 'REACTIVACION';

export interface HistorialCandidato {
  id: string;

  // Referencias
  candidatoId: string;           // Referencia al candidato
  aplicacionId: string;          // Referencia a la aplicación

  // Información del cambio
  estadoAnterior: EstadoKanban;  // Estado antes del cambio
  estadoNuevo: EstadoKanban;     // Estado después del cambio
  tipoCambio: TipoCambioHistorial;

  // Quién y cuándo
  realizadoPor: string;          // Usuario que hizo el cambio
  realizadoPorNombre: string;    // Nombre para queries rápidas
  fechaCambio: Date;             // Timestamp del cambio

  // Motivos y comentarios (opcionales)
  motivo?: string;               // Razón del cambio
  comentarios?: string;          // Comentarios adicionales

  // Metadata adicional
  tiempoEnEstadoAnterior?: number; // Días en el estado anterior (opcional)
  etapaProceso?: string;          // Fase del proceso (opcional)

  created_at: Date;
}

// ============================================================================
// INPUTS PARA OPERACIONES
// ============================================================================

export interface CrearHistorialInput {
  candidatoId: string;
  aplicacionId: string;
  estadoAnterior: EstadoKanban;
  estadoNuevo: EstadoKanban;
  tipoCambio: TipoCambioHistorial;
  realizadoPor: string;
  realizadoPorNombre: string;
  fechaCambio?: Date;
  motivo?: string;
  comentarios?: string;
  tiempoEnEstadoAnterior?: number;
  etapaProceso?: string;
}

export interface HistorialFiltros {
  candidatoId?: string;
  aplicacionId?: string;
  realizadoPor?: string;
  tipoCambio?: TipoCambioHistorial;
  estadoNuevo?: EstadoKanban;
  fechaDesde?: Date;
  fechaHasta?: Date;
  limit?: number;
  offset?: number;
}