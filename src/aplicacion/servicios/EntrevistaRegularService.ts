// ============================================================================
// SERVICIO ENTREVISTA REGULAR - Lógica de negocio para entrevistas presenciales
// ============================================================================

import {
  EntrevistaRegular,
  CrearEntrevistaRegularInput,
  ActualizarEntrevistaRegularInput,
  TipoEntrevista
} from '../../dominio/entidades/EntrevistaRegular';
import { IEntrevistaRegularRepository } from '../../dominio/repositorios/IEntrevistaRegularRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';

export class EntrevistaRegularService {
  constructor(
    private entrevistaRepository: IEntrevistaRegularRepository,
    private aplicacionRepository: IAplicacionCandidatoRepository
  ) {}

  /**
   * Crear una nueva entrevista regular
   */
  async crear(entrevistaInput: CrearEntrevistaRegularInput): Promise<EntrevistaRegular> {
    // Validar que la aplicación existe
    const aplicacion = await this.aplicacionRepository.obtenerPorId(entrevistaInput.aplicacionCandidatoId);
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${entrevistaInput.aplicacionCandidatoId} no encontrada`);
    }

    // Verificar que no existe ya una entrevista de este tipo para esta aplicación
    const existeEntrevista = await this.entrevistaRepository.existeParaAplicacionYTipo(
      entrevistaInput.aplicacionCandidatoId,
      entrevistaInput.tipo_entrevista
    );
    if (existeEntrevista) {
      throw new Error(`Ya existe una entrevista ${entrevistaInput.tipo_entrevista.toLowerCase()} registrada para la aplicación ${entrevistaInput.aplicacionCandidatoId}`);
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
  async obtenerPorId(id: string): Promise<EntrevistaRegular | null> {
    return this.entrevistaRepository.obtenerPorId(id);
  }

  /**
   * Obtener entrevista por aplicación y tipo
   */
  async obtenerPorAplicacionYTipo(aplicacionCandidatoId: string, tipo_entrevista: TipoEntrevista): Promise<EntrevistaRegular | null> {
    return this.entrevistaRepository.obtenerPorAplicacionYTipo(aplicacionCandidatoId, tipo_entrevista);
  }

  /**
   * Actualizar entrevista existente
   */
  async actualizar(id: string, entrevistaInput: ActualizarEntrevistaRegularInput): Promise<EntrevistaRegular | null> {
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
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    tipo_entrevista?: TipoEntrevista;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<EntrevistaRegular[]> {
    return this.entrevistaRepository.listar(filtros);
  }

  /**
   * Contar entrevistas con filtros
   */
  async contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    tipo_entrevista?: TipoEntrevista;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<number> {
    return this.entrevistaRepository.contar(filtros);
  }

  /**
   * Verificar si existe entrevista para una aplicación y tipo específicos
   */
  async existeEntrevistaParaAplicacionYTipo(aplicacionCandidatoId: string, tipo_entrevista: TipoEntrevista): Promise<boolean> {
    return this.entrevistaRepository.existeParaAplicacionYTipo(aplicacionCandidatoId, tipo_entrevista);
  }

  /**
   * Validar datos de entrada de entrevista
   */
  private validarEntrevistaInput(input: Partial<CrearEntrevistaRegularInput | ActualizarEntrevistaRegularInput>): void {
    // Validar formato de email
    if (input.correo_contacto) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.correo_contacto)) {
        throw new Error('El correo electrónico no tiene un formato válido');
      }
    }

    // Validar formato de hora (HH:MM)
    if (input.hora_entrevista) {
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(input.hora_entrevista)) {
        throw new Error('La hora debe tener el formato HH:MM (ejemplo: 14:30)');
      }
    }

    // Validar fecha de entrevista (permitir cualquier fecha)
    // Se eliminó la validación de fecha anterior a hoy para permitir flexibilidad

    // Validar tipo de entrevista (solo para creación, no para actualización)
    if ('tipo_entrevista' in input && input.tipo_entrevista && !['PRIMERA', 'SEGUNDA'].includes(input.tipo_entrevista)) {
      throw new Error('El tipo de entrevista debe ser PRIMERA o SEGUNDA');
    }
  }
}