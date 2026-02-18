// ============================================================================
// REPOSITORIO REFERENCIA - Interface de dominio
// ============================================================================

import {
  Referencia,
  CrearReferenciaInput,
  ActualizarReferenciaInput
} from '../entidades/Referencia';

export interface IReferenciaRepository {
  /**
   * Crear una nueva referencia
   */
  crear(referencia: CrearReferenciaInput): Promise<Referencia>;

  /**
   * Obtener referencia por ID
   */
  obtenerPorId(id: string): Promise<Referencia | null>;

  /**
   * Actualizar referencia existente
   */
  actualizar(id: string, referencia: ActualizarReferenciaInput): Promise<Referencia | null>;

  /**
   * Eliminar referencia
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Listar referencias con filtros opcionales
   */
  listar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    empresa?: string;
    limit?: number;
    offset?: number;
  }): Promise<Referencia[]>;

  /**
   * Contar referencias con filtros
   */
  contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    empresa?: string;
  }): Promise<number>;

  /**
   * Listar referencias por aplicación candidata
   */
  listarPorAplicacion(aplicacionCandidatoId: string): Promise<Referencia[]>;
}