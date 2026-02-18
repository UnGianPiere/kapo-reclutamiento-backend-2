// ============================================================================
// REPOSITORIO DEBIDA DILIGENCIA - Interface de dominio
// ============================================================================

import {
  DebidaDiligencia,
  CrearDebidaDiligenciaInput,
  ActualizarDebidaDiligenciaInput,
  NivelRiesgo
} from '../entidades/DebidaDiligencia';

export interface IDebidaDiligenciaRepository {
  /**
   * Crear una nueva evaluación de debida diligencia
   */
  crear(evaluacion: CrearDebidaDiligenciaInput): Promise<DebidaDiligencia>;

  /**
   * Obtener evaluación por ID
   */
  obtenerPorId(id: string): Promise<DebidaDiligencia | null>;

  /**
   * Obtener evaluación por aplicación candidata
   */
  obtenerPorAplicacion(aplicacionCandidatoId: string): Promise<DebidaDiligencia | null>;

  /**
   * Actualizar evaluación existente
   */
  actualizar(id: string, evaluacion: ActualizarDebidaDiligenciaInput): Promise<DebidaDiligencia | null>;

  /**
   * Eliminar evaluación
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Listar evaluaciones con filtros opcionales
   */
  listar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    evaluador_id?: string;
    nivel_riesgo?: NivelRiesgo;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<DebidaDiligencia[]>;

  /**
   * Contar evaluaciones con filtros
   */
  contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    evaluador_id?: string;
    nivel_riesgo?: NivelRiesgo;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<number>;

  /**
   * Verificar si existe evaluación para una aplicación específica
   */
  existeParaAplicacion(aplicacionCandidatoId: string): Promise<boolean>;
}
