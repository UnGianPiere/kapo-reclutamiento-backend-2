// ============================================================================
// REPOSITORIO APLICACION CANDIDATO - Contrato de dominio
// ============================================================================

import { AplicacionCandidato, CrearAplicacionInput, ActualizarAplicacionInput } from '../entidades/AplicacionCandidato';
import { EstadoKanban } from '../entidades/EstadoKanban';
import mongoose from 'mongoose';

export interface IAplicacionCandidatoRepository {
  /**
   * Crear nueva aplicación
   */
  crear(input: CrearAplicacionInput, session?: mongoose.ClientSession): Promise<AplicacionCandidato>;

  /**
   * Obtener aplicación por ID
   */
  obtenerPorId(id: string): Promise<AplicacionCandidato | null>;

  /**
   * Obtener aplicaciones por candidato
   */
  obtenerPorCandidato(candidatoId: string): Promise<AplicacionCandidato[]>;

  /**
   * Obtener aplicaciones por convocatoria
   */
  obtenerPorConvocatoria(convocatoriaId: string): Promise<AplicacionCandidato[]>;

  /**
   * Obtener aplicación específica de candidato a convocatoria
   */
  obtenerPorCandidatoYConvocatoria(candidatoId: string, convocatoriaId: string): Promise<AplicacionCandidato | null>;

  /**
   * Actualizar aplicación
   */
  actualizar(id: string, input: ActualizarAplicacionInput): Promise<AplicacionCandidato>;

  /**
   * Cambiar estado de aplicación en el kanban
   */
  cambiarEstadoKanban(id: string, estadoKanban: EstadoKanban): Promise<AplicacionCandidato>;

  /**
   * Listar aplicaciones con filtros
   */
  listar(filtros?: {
    estadoKanban?: EstadoKanban;
    candidatoId?: string;
    convocatoriaId?: string;
    ordenPrioridad?: number;
    aplicadoPor?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    posibleDuplicado?: boolean;
    duplicadoRevisado?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ aplicaciones: AplicacionCandidato[]; total: number }>;

  /**
   * Verificar si candidato ya aplicó a convocatoria
   */
  existeAplicacion(candidatoId: string, convocatoriaId: string): Promise<boolean>;

  /**
   * Eliminar aplicación
   */
  eliminar(id: string): Promise<void>;

  /**
   * Obtener estadísticas por convocatoria
   */
  obtenerEstadisticasPorConvocatoria(convocatoriaId: string): Promise<{
    total: number;
    porEstadoKanban: Record<EstadoKanban, number>;
    porPosiblesCandidatos: number;
    duplicadosPendientes: number;
  }>;
}