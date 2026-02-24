// ============================================================================
// REPOSITORIO HISTORIAL CANDIDATO - Contrato de dominio
// ============================================================================

import { HistorialCandidato, CrearHistorialInput, HistorialFiltros } from '../entidades/HistorialCandidato';

export interface IHistorialCandidatoRepository {
  /**
   * Crear nueva entrada en el historial
   */
  crear(input: CrearHistorialInput): Promise<HistorialCandidato>;

  /**
   * Obtener historial completo de una aplicación
   */
  obtenerPorAplicacion(aplicacionId: string): Promise<HistorialCandidato[]>;

  /**
   * Obtener historial de un candidato
   */
  obtenerPorCandidato(candidatoId: string): Promise<HistorialCandidato[]>;

  /**
   * Obtener historial de una convocatoria
   */
  obtenerPorConvocatoria(convocatoriaId: string): Promise<HistorialCandidato[]>;

  /**
   * Obtener entrada específica por ID
   */
  obtenerPorId(id: string): Promise<HistorialCandidato | null>;

  /**
   * Listar historial con filtros
   */
  listar(filtros?: HistorialFiltros): Promise<{ historial: HistorialCandidato[]; total: number }>;

  /**
   * Obtener último cambio de estado para una aplicación
   */
  obtenerUltimoCambioEstado(aplicacionId: string): Promise<HistorialCandidato | null>;

  /**
   * Obtener último historial de una aplicación específica
   */
  obtenerUltimoHistorialPorAplicacion(aplicacionId: string): Promise<HistorialCandidato | null>;

  /**
   * Limpiar historial antiguo (para mantenimiento)
   */
  limpiarHistorico(fechaLimite: Date): Promise<number>;
}