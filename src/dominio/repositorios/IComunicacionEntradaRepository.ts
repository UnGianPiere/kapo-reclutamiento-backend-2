// ============================================================================
// REPOSITORIO COMUNICACION ENTRADA - Interface de dominio
// ============================================================================

import {
  ComunicacionEntrada,
  CrearComunicacionEntradaInput,
  ActualizarComunicacionEntradaInput
} from '../entidades/ComunicacionEntrada';

export interface IComunicacionEntradaRepository {
  /**
   * Crear una nueva comunicación de entrada
   */
  crear(comunicacion: CrearComunicacionEntradaInput): Promise<ComunicacionEntrada>;

  /**
   * Obtener comunicación por ID
   */
  obtenerPorId(id: string): Promise<ComunicacionEntrada | null>;

  /**
   * Obtener comunicación por aplicación candidata
   */
  obtenerPorAplicacion(aplicacionCandidatoId: string): Promise<ComunicacionEntrada | null>;

  /**
   * Actualizar comunicación existente
   */
  actualizar(id: string, comunicacion: ActualizarComunicacionEntradaInput): Promise<ComunicacionEntrada | null>;

  /**
   * Eliminar comunicación
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Verificar si existe comunicación para una aplicación específica
   */
  existeParaAplicacion(aplicacionCandidatoId: string): Promise<boolean>;
}
