// ============================================================================
// SERVICIO HISTORIAL CANDIDATO - Gestión del historial de movimientos
// ============================================================================

import {
  HistorialCandidato,
  CrearHistorialInput,
  HistorialFiltros
} from '../../dominio/entidades/HistorialCandidato';
import { IHistorialCandidatoRepository } from '../../dominio/repositorios/IHistorialCandidatoRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';

export class HistorialCandidatoService {
  constructor(
    private historialRepository: IHistorialCandidatoRepository,
    private aplicacionRepository: IAplicacionCandidatoRepository
  ) {}

  /**
   * Registrar un nuevo cambio en el historial
   */
  async registrarCambio(input: CrearHistorialInput): Promise<HistorialCandidato> {
    // Validar que la aplicación existe
    const aplicacion = await this.aplicacionRepository.obtenerPorId(input.aplicacionId);
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${input.aplicacionId} no encontrada`);
    }

    // Calcular tiempo en estado anterior si no se proporciona
    if (input.tiempoEnEstadoAnterior === undefined) {
      input.tiempoEnEstadoAnterior = this.calcularTiempoEnEstado(aplicacion.fechaAplicacion);
    }

    // Determinar etapa del proceso si no se proporciona
    if (!input.etapaProceso) {
      input.etapaProceso = this.determinarEtapaProceso(input.estadoNuevo);
    }

    // Establecer fecha de cambio si no se proporciona
    if (!input.fechaCambio) {
      input.fechaCambio = new Date();
    }

    return await this.historialRepository.crear(input);
  }

  /**
   * Obtener historial completo de una aplicación
   */
  async obtenerHistorialAplicacion(aplicacionId: string): Promise<HistorialCandidato[]> {
    return await this.historialRepository.obtenerPorAplicacion(aplicacionId);
  }

  /**
   * Obtener historial de un candidato
   */
  async obtenerHistorialCandidato(candidatoId: string): Promise<HistorialCandidato[]> {
    return await this.historialRepository.obtenerPorCandidato(candidatoId);
  }

  /**
   * Listar historial con filtros avanzados
   */
  async listarHistorial(filtros?: HistorialFiltros): Promise<{ historial: HistorialCandidato[]; total: number }> {
    return await this.historialRepository.listar(filtros);
  }

  /**
   * Obtener último historial de una aplicación específica
   */
  async obtenerUltimoHistorialPorAplicacion(aplicacionId: string): Promise<HistorialCandidato | null> {
    return await this.historialRepository.obtenerUltimoHistorialPorAplicacion(aplicacionId);
  }

  /**
   * Obtener último cambio de estado de una aplicación
   */
  async obtenerUltimoCambioEstado(aplicacionId: string): Promise<HistorialCandidato | null> {
    return await this.historialRepository.obtenerUltimoHistorialPorAplicacion(aplicacionId);
  }

  /**
   * Generar estadísticas de conversión por etapa
   */
  async generarEstadisticasConversion(convocatoriaId?: string, fechaDesde?: Date, fechaHasta?: Date) {
    // Obtener todos los registros del historial
    const filtros: HistorialFiltros = {};
    if (fechaDesde) filtros.fechaDesde = fechaDesde;
    if (fechaHasta) filtros.fechaHasta = fechaHasta;

    if (convocatoriaId) {
      // Nota: Para filtrar por convocatoria necesitaríamos una query más compleja
      // Por ahora devolvemos todos y filtramos después
    }

    const { historial } = await this.listarHistorial(filtros);

    // Calcular estadísticas
    const estadisticas = {
      totalMovimientos: historial.length,
      porTipoCambio: this.contarPorTipo(historial, 'tipoCambio'),
      porEstadoDestino: this.contarPorTipo(historial, 'estadoNuevo'),
      tiempoPromedioPorEstado: this.calcularTiemposPromedio(historial),
      tasaConversionPorEtapa: this.calcularTasaConversion(historial)
    };

    return estadisticas;
  }

  /**
   * Métodos auxiliares
   */
  private calcularTiempoEnEstado(fechaAplicacion: Date): number {
    const ahora = new Date();
    const tiempoMs = ahora.getTime() - fechaAplicacion.getTime();
    return Math.floor(tiempoMs / (1000 * 60 * 60 * 24)); // Días
  }

  private determinarEtapaProceso(estado: string): string {
    const etapas = {
      'CVS_RECIBIDOS': 'RECEPCION',
      'POR_LLAMAR': 'CONTACTO_INICIAL',
      'ENTREVISTA_PREVIA': 'EVALUACION_INICIAL',
      'PROGRAMAR_1RA_ENTREVISTA': 'PROGRAMACION',
      'PROGRAMAR_2DA_ENTREVISTA': 'PROGRAMACION',
      'REFERENCIAS': 'VERIFICACION',
      'EVALUACION_ANTISOBORNO': 'VERIFICACION',
      'APROBACION_GERENCIA': 'APROBACION_FINAL',
      'LLAMAR_COMUNICAR_ENTRADA': 'CONTRATACION',
      'FINALIZADA': 'CONTRATADO',
      'RECHAZADO_POR_CANDIDATO': 'RECHAZADO',
      'DESCARTADO': 'RECHAZADO',
      'POSIBLES_CANDIDATOS': 'REACTIVACION'
    };

    return etapas[estado as keyof typeof etapas] || 'DESCONOCIDO';
  }

  private contarPorTipo(historial: HistorialCandidato[], campo: keyof HistorialCandidato): Record<string, number> {
    return historial.reduce((acc, item) => {
      const valor = String(item[campo]);
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calcularTiemposPromedio(historial: HistorialCandidato[]): Record<string, number> {
    const tiemposPorEstado: Record<string, number[]> = {};

    historial.forEach(item => {
      if (item.tiempoEnEstadoAnterior !== undefined) {
        const estado = item.estadoAnterior;
        if (!tiemposPorEstado[estado]) {
          tiemposPorEstado[estado] = [];
        }
        tiemposPorEstado[estado].push(item.tiempoEnEstadoAnterior);
      }
    });

    const promedios: Record<string, number> = {};
    Object.entries(tiemposPorEstado).forEach(([estado, tiempos]) => {
      const promedio = tiempos.reduce((sum, tiempo) => sum + tiempo, 0) / tiempos.length;
      promedios[estado] = Math.round(promedio * 10) / 10; // Un decimal
    });

    return promedios;
  }

  /**
   * Limpiar registros históricos anteriores a una fecha
   * Método público para operaciones administrativas
   */
  async limpiarHistorico(fechaLimite: Date): Promise<number> {
    return await this.historialRepository.limpiarHistorico(fechaLimite);
  }

  private calcularTasaConversion(_historial: HistorialCandidato[]): Record<string, number> {
    // Lógica simplificada - en una implementación real sería más compleja
    // Considerar como "exitosos" los movimientos que avanzan en el proceso
    // (esto sería más sofisticado en una implementación real)

    return {}; // Placeholder - implementación simplificada
  }
}