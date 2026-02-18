// ============================================================================
// SERVICIO REFERENCIA - Lógica de negocio para referencias de candidatos
// ============================================================================

import {
  Referencia,
  CrearReferenciaInput,
  ActualizarReferenciaInput
} from '../../dominio/entidades/Referencia';
import { IReferenciaRepository } from '../../dominio/repositorios/IReferenciaRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';

export class ReferenciaService {
  constructor(
    private referenciaRepository: IReferenciaRepository,
    private aplicacionRepository: IAplicacionCandidatoRepository
  ) {}

  /**
   * Crear una nueva referencia
   */
  async crear(referenciaInput: CrearReferenciaInput): Promise<Referencia> {
    // Validar que la aplicación existe
    const aplicacion = await this.aplicacionRepository.obtenerPorId(referenciaInput.aplicacionCandidatoId);
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${referenciaInput.aplicacionCandidatoId} no encontrada`);
    }

    // Validaciones de negocio
    this.validarReferenciaInput(referenciaInput);

    // Crear la referencia
    const referencia = await this.referenciaRepository.crear(referenciaInput);

    return referencia;
  }

  /**
   * Obtener referencia por ID
   */
  async obtenerPorId(id: string): Promise<Referencia | null> {
    return await this.referenciaRepository.obtenerPorId(id);
  }

  /**
   * Actualizar referencia existente
   */
  async actualizar(id: string, referenciaInput: ActualizarReferenciaInput): Promise<Referencia | null> {
    // Validar que la referencia existe
    const referenciaExistente = await this.referenciaRepository.obtenerPorId(id);
    if (!referenciaExistente) {
      throw new Error(`Referencia con ID ${id} no encontrada`);
    }

    // Validaciones de negocio
    this.validarActualizacionReferenciaInput(referenciaInput);

    // Actualizar la referencia
    const referencia = await this.referenciaRepository.actualizar(id, referenciaInput);

    return referencia;
  }

  /**
   * Eliminar referencia
   */
  async eliminar(id: string): Promise<boolean> {
    // Validar que la referencia existe
    const referencia = await this.referenciaRepository.obtenerPorId(id);
    if (!referencia) {
      throw new Error(`Referencia con ID ${id} no encontrada`);
    }

    return await this.referenciaRepository.eliminar(id);
  }

  /**
   * Listar referencias con filtros opcionales
   */
  async listar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    empresa?: string;
    limit?: number;
    offset?: number;
  }): Promise<Referencia[]> {
    return await this.referenciaRepository.listar(filtros);
  }

  /**
   * Contar referencias con filtros
   */
  async contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    empresa?: string;
  }): Promise<number> {
    return await this.referenciaRepository.contar(filtros);
  }

  /**
   * Listar referencias por aplicación candidata
   */
  async listarPorAplicacion(aplicacionCandidatoId: string): Promise<Referencia[]> {
    // Validar que la aplicación existe (opcional para listados)
    const aplicacion = await this.aplicacionRepository.obtenerPorId(aplicacionCandidatoId);
    if (!aplicacion) {
      // En lugar de lanzar error, retornar array vacío para listados
      return [];
    }

    return await this.referenciaRepository.listarPorAplicacion(aplicacionCandidatoId);
  }

  /**
   * Validar datos de entrada para crear referencia
   */
  private validarReferenciaInput(input: CrearReferenciaInput): void {
    if (!input.numero_telefono?.trim()) {
      throw new Error('El número de teléfono es requerido');
    }
    if (!input.nombresyapellidos?.trim()) {
      throw new Error('Los nombres y apellidos son requeridos');
    }
    // detalles, empresa, comentarios y archivosurl son opcionales
  }

  /**
   * Validar datos de entrada para actualizar referencia
   */
  private validarActualizacionReferenciaInput(input: ActualizarReferenciaInput): void {
    if (input.numero_telefono !== undefined && !input.numero_telefono?.trim()) {
      throw new Error('El número de teléfono no puede estar vacío');
    }
    if (input.nombresyapellidos !== undefined && !input.nombresyapellidos?.trim()) {
      throw new Error('Los nombres y apellidos no pueden estar vacíos');
    }
    // detalles, empresa, comentarios y archivosurl son opcionales - no requieren validación adicional
  }
}