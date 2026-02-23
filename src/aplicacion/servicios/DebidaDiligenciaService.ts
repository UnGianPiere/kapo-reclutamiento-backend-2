// ============================================================================
// SERVICIO DEBIDA DILIGENCIA - Lógica de negocio para evaluaciones de debida diligencia
// ============================================================================

import {
  DebidaDiligencia,
  CrearDebidaDiligenciaInput,
  ActualizarDebidaDiligenciaInput,
  NivelRiesgo
} from '../../dominio/entidades/DebidaDiligencia';
import { IDebidaDiligenciaRepository } from '../../dominio/repositorios/IDebidaDiligenciaRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';

export class DebidaDiligenciaService {
  constructor(
    private debidaDiligenciaRepository: IDebidaDiligenciaRepository,
    private aplicacionRepository: IAplicacionCandidatoRepository
  ) {}

  /**
   * Crear una nueva evaluación de debida diligencia
   */
  async crear(evaluacionInput: CrearDebidaDiligenciaInput): Promise<DebidaDiligencia> {
    // Validar que la aplicación existe
    const aplicacion = await this.aplicacionRepository.obtenerPorId(evaluacionInput.aplicacionCandidatoId);
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${evaluacionInput.aplicacionCandidatoId} no encontrada`);
    }

    // Verificar que no existe ya una evaluación para esta aplicación
    const existeEvaluacion = await this.debidaDiligenciaRepository.existeParaAplicacion(
      evaluacionInput.aplicacionCandidatoId
    );
    if (existeEvaluacion) {
      throw new Error(`Ya existe una evaluación de debida diligencia registrada para la aplicación ${evaluacionInput.aplicacionCandidatoId}`);
    }

    // Validaciones de negocio
    this.validarEvaluacionInput(evaluacionInput);

    // Crear la evaluación
    const evaluacion = await this.debidaDiligenciaRepository.crear(evaluacionInput);

    return evaluacion;
  }

  /**
   * Obtener evaluación por ID
   */
  async obtenerPorId(id: string): Promise<DebidaDiligencia | null> {
    return this.debidaDiligenciaRepository.obtenerPorId(id);
  }

  /**
   * Obtener evaluación por aplicación
   */
  async obtenerPorAplicacion(aplicacionCandidatoId: string): Promise<DebidaDiligencia | null> {
    return this.debidaDiligenciaRepository.obtenerPorAplicacion(aplicacionCandidatoId);
  }

  /**
   * Actualizar evaluación existente
   */
  async actualizar(id: string, evaluacionInput: ActualizarDebidaDiligenciaInput): Promise<DebidaDiligencia | null> {
    // Validar que la evaluación existe
    const evaluacionExistente = await this.debidaDiligenciaRepository.obtenerPorId(id);
    if (!evaluacionExistente) {
      throw new Error(`Evaluación de debida diligencia con ID ${id} no encontrada`);
    }

    // Filtrar controles inválidos
    if (evaluacionInput.controles) {
      evaluacionInput.controles = evaluacionInput.controles.filter(control => 
        control && 
        typeof control === 'object' && 
        control.criterio && 
        control.responsable && 
        control.fecha_limite
      )
    }

    // Validaciones de negocio
    this.validarEvaluacionInput(evaluacionInput);

    // Actualizar la evaluación
    const evaluacion = await this.debidaDiligenciaRepository.actualizar(id, evaluacionInput);

    return evaluacion;
  }

  /**
   * Eliminar evaluación
   */
  async eliminar(id: string): Promise<boolean> {
    // Validar que la evaluación existe
    const evaluacion = await this.debidaDiligenciaRepository.obtenerPorId(id);
    if (!evaluacion) {
      throw new Error(`Evaluación de debida diligencia con ID ${id} no encontrada`);
    }

    return this.debidaDiligenciaRepository.eliminar(id);
  }

  /**
   * Listar evaluaciones con filtros
   */
  async listar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    evaluador_id?: string;
    nivel_riesgo?: NivelRiesgo;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
    offset?: number;
  }): Promise<DebidaDiligencia[]> {
    return this.debidaDiligenciaRepository.listar(filtros);
  }

  /**
   * Contar evaluaciones con filtros
   */
  async contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    evaluador_id?: string;
    nivel_riesgo?: NivelRiesgo;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<number> {
    return this.debidaDiligenciaRepository.contar(filtros);
  }

  /**
   * Verificar si existe evaluación para una aplicación específica
   */
  async existeEvaluacionParaAplicacion(aplicacionCandidatoId: string): Promise<boolean> {
    return this.debidaDiligenciaRepository.existeParaAplicacion(aplicacionCandidatoId);
  }

  /**
   * Validar datos de entrada de evaluación
   */
  private validarEvaluacionInput(input: Partial<CrearDebidaDiligenciaInput | ActualizarDebidaDiligenciaInput>): void {
    // Validar código (solo para creación)
    if ('codigo' in input && input.codigo && input.codigo.trim() !== 'FO-ADM-018') {
      throw new Error('El código debe ser FO-ADM-018');
    }

    // Validar criterios (deben existir al menos algunos)
    if (input.criterios && Object.keys(input.criterios).length === 0) {
      throw new Error('Debe incluir al menos un criterio de evaluación');
    }

    // Validar puntaje total
    if (input.puntaje_total !== undefined && (input.puntaje_total < 0 || input.puntaje_total > 100)) {
      throw new Error('El puntaje total debe estar entre 0 y 100');
    }

    // Validar nivel de riesgo
    if (input.nivel_riesgo && !['BAJO', 'MODERADO', 'ALTO', 'CRITICO'].includes(input.nivel_riesgo)) {
      throw new Error('El nivel de riesgo debe ser BAJO, MODERADO, ALTO o CRITICO');
    }

    // Validar acción
    if (input.accion && !['TERMINAR', 'ACEPTAR_CON_CONTROLES', 'ACEPTAR'].includes(input.accion)) {
      throw new Error('La acción debe ser TERMINAR, ACEPTAR_CON_CONTROLES o ACEPTAR');
    }

    // Validar controles si la acción es ACEPTAR_CON_CONTROLES
    if (input.accion === 'ACEPTAR_CON_CONTROLES' && (!input.controles || input.controles.length === 0)) {
      throw new Error('Si la acción es ACEPTAR_CON_CONTROLES, debe incluir al menos un control');
    }

    // Filtrar controles inválidos
    if (input.controles) {
      input.controles = input.controles.filter(control => 
        control && 
        control.criterio && 
        control.responsable && 
        control.fecha_limite
      )
    }
  }
}
