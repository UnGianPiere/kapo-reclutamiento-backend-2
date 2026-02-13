// ============================================================================
// SERVICIO ENTREVISTA LLAMADA - Lógica de negocio para entrevistas telefónicas
// ============================================================================

import {
  EntrevistaLlamada,
  CrearEntrevistaInput,
  ActualizarEntrevistaInput
} from '../../dominio/entidades/EntrevistaLlamada';
import { IEntrevistaLlamadaRepository } from '../../dominio/repositorios/IEntrevistaLlamadaRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';

export class EntrevistaLlamadaService {
  constructor(
    private entrevistaRepository: IEntrevistaLlamadaRepository,
    private aplicacionRepository: IAplicacionCandidatoRepository
  ) {}

  /**
   * Crear una nueva entrevista de llamada
   */
  async crear(entrevistaInput: CrearEntrevistaInput): Promise<EntrevistaLlamada> {
    // Validar que la aplicación existe
    const aplicacion = await this.aplicacionRepository.obtenerPorId(entrevistaInput.aplicacionCandidatoId);
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${entrevistaInput.aplicacionCandidatoId} no encontrada`);
    }

    // Verificar que no existe ya una entrevista para esta aplicación
    const existeEntrevista = await this.entrevistaRepository.existeParaAplicacionCandidato(entrevistaInput.aplicacionCandidatoId);
    if (existeEntrevista) {
      throw new Error(`Ya existe una entrevista registrada para la aplicación ${entrevistaInput.aplicacionCandidatoId}`);
    }

    // Validaciones de negocio
    this.validarEntrevistaInput(entrevistaInput);

    // Crear la entrevista
    const entrevista = await this.entrevistaRepository.crear(entrevistaInput);

    return entrevista;
  }

  /**
   * Obtener entrevista por ID
   */
  async obtenerPorId(id: string): Promise<EntrevistaLlamada | null> {
    return this.entrevistaRepository.obtenerPorId(id);
  }

  /**
   * Obtener entrevista por aplicación candidata
   */
  async obtenerPorAplicacionCandidatoId(aplicacionCandidatoId: string): Promise<EntrevistaLlamada | null> {
    return this.entrevistaRepository.obtenerPorAplicacionCandidatoId(aplicacionCandidatoId);
  }

  /**
   * Actualizar entrevista existente
   */
  async actualizar(id: string, entrevistaInput: ActualizarEntrevistaInput): Promise<EntrevistaLlamada | null> {
    // Validar que la entrevista existe
    const entrevistaExistente = await this.entrevistaRepository.obtenerPorId(id);
    if (!entrevistaExistente) {
      throw new Error(`Entrevista con ID ${id} no encontrada`);
    }

    // Validaciones de negocio
    this.validarEntrevistaInput(entrevistaInput);

    // Actualizar la entrevista
    const entrevista = await this.entrevistaRepository.actualizar(id, entrevistaInput);

    return entrevista;
  }

  /**
   * Eliminar entrevista
   */
  async eliminar(id: string): Promise<boolean> {
    // Validar que la entrevista existe
    const entrevista = await this.entrevistaRepository.obtenerPorId(id);
    if (!entrevista) {
      throw new Error(`Entrevista con ID ${id} no encontrada`);
    }

    return this.entrevistaRepository.eliminar(id);
  }

  /**
   * Listar entrevistas con filtros
   */
  async listar(filtros?: {
    aplicacionId?: string;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<EntrevistaLlamada[]> {
    return this.entrevistaRepository.listar(filtros);
  }

  /**
   * Contar entrevistas con filtros
   */
  async contar(filtros?: {
    aplicacionId?: string;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<number> {
    return this.entrevistaRepository.contar(filtros);
  }

  /**
   * Verificar si existe entrevista para una aplicación candidata
   */
  async existeEntrevistaParaAplicacion(aplicacionCandidatoId: string): Promise<boolean> {
    return this.entrevistaRepository.existeParaAplicacionCandidato(aplicacionCandidatoId);
  }

  /**
   * Validar datos de entrada de entrevista
   */
  private validarEntrevistaInput(input: Partial<CrearEntrevistaInput | ActualizarEntrevistaInput>): void {
    // Validar edad
    if (input.edad !== undefined && (input.edad < 18 || input.edad > 100)) {
      throw new Error('La edad debe estar entre 18 y 100 años');
    }

    // Validar calificaciones (1-10)
    if (input.desenvolvimiento !== undefined && (input.desenvolvimiento < 1 || input.desenvolvimiento > 10)) {
      throw new Error('La calificación de desenvolvimiento debe estar entre 1 y 10');
    }

    if (input.interes_puesto !== undefined && (input.interes_puesto < 1 || input.interes_puesto > 10)) {
      throw new Error('La calificación de interés en el puesto debe estar entre 1 y 10');
    }

    // Validar pretensión salarial
    if (input.pretension_monto !== undefined && input.pretension_monto < 0) {
      throw new Error('La pretensión salarial no puede ser negativa');
    }

    // Validar fecha de entrevista (no puede ser futura)
    if (input.fecha_entrevista && input.fecha_entrevista > new Date()) {
      throw new Error('La fecha de entrevista no puede ser futura');
    }
  }
}