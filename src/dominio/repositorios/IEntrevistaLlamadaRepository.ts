// ============================================================================
// REPOSITORIO ENTREVISTA LLAMADA - Interface de dominio
// ============================================================================

import {
  EntrevistaLlamada,
  CrearEntrevistaInput,
  ActualizarEntrevistaInput
} from '../entidades/EntrevistaLlamada';

export interface IEntrevistaLlamadaRepository {
  /**
   * Crear una nueva entrevista de llamada
   */
  crear(entrevista: CrearEntrevistaInput): Promise<EntrevistaLlamada>;

  /**
   * Obtener entrevista por ID
   */
  obtenerPorId(id: string): Promise<EntrevistaLlamada | null>;

  /**
   * Obtener entrevista por aplicación candidata
   */
  obtenerPorAplicacionCandidatoId(aplicacionCandidatoId: string): Promise<EntrevistaLlamada | null>;

  /**
   * Actualizar entrevista existente
   */
  actualizar(id: string, entrevista: ActualizarEntrevistaInput): Promise<EntrevistaLlamada | null>;

  /**
   * Eliminar entrevista
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Listar entrevistas con filtros opcionales
   */
  listar(filtros?: {
    aplicacionCandidatoId?: string;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<EntrevistaLlamada[]>;

  /**
   * Contar entrevistas con filtros
   */
  contar(filtros?: {
    aplicacionCandidatoId?: string;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<number>;

  /**
   * Verificar si existe entrevista para una aplicación candidata
   */
  existeParaAplicacionCandidato(aplicacionCandidatoId: string): Promise<boolean>;
}