// ============================================================================
// REPOSITORIO ENTREVISTA REGULAR - Interface de dominio
// ============================================================================

import {
  EntrevistaRegular,
  CrearEntrevistaRegularInput,
  ActualizarEntrevistaRegularInput,
  TipoEntrevista
} from '../entidades/EntrevistaRegular';

export interface IEntrevistaRegularRepository {
  /**
   * Crear una nueva entrevista regular
   */
  crear(entrevista: CrearEntrevistaRegularInput): Promise<EntrevistaRegular>;

  /**
   * Obtener entrevista por ID
   */
  obtenerPorId(id: string): Promise<EntrevistaRegular | null>;

  /**
   * Obtener entrevista por aplicación candidata y tipo
   */
  obtenerPorAplicacionYTipo(aplicacionCandidatoId: string, tipo_entrevista: TipoEntrevista): Promise<EntrevistaRegular | null>;

  /**
   * Actualizar entrevista existente
   */
  actualizar(id: string, entrevista: ActualizarEntrevistaRegularInput): Promise<EntrevistaRegular | null>;

  /**
   * Eliminar entrevista
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Listar entrevistas con filtros opcionales
   */
  listar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    tipo_entrevista?: TipoEntrevista;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<EntrevistaRegular[]>;

  /**
   * Contar entrevistas con filtros
   */
  contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    tipo_entrevista?: TipoEntrevista;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<number>;

  /**
   * Verificar si existe entrevista para una aplicación y tipo específicos
   */
  existeParaAplicacionYTipo(aplicacionCandidatoId: string, tipo_entrevista: TipoEntrevista): Promise<boolean>;
}