// ============================================================================
// REPOSITORIO CANDIDATO - Contrato de dominio
// ============================================================================

import { Candidato } from '../entidades/Candidato';
import mongoose from 'mongoose';

export interface ICandidatoRepository {
  /**
   * Crear un nuevo candidato
   */
  crear(candidato: Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'>, session?: mongoose.ClientSession): Promise<Candidato>;

  /**
   * Buscar candidato por DNI (único)
   */
  buscarPorDNI(dni: string): Promise<Candidato | null>;

  /**
   * Buscar candidato por correo (único)
   */
  buscarPorCorreo(correo: string): Promise<Candidato | null>;

  /**
   * Buscar candidato por teléfono
   */
  buscarPorTelefono(telefono: string): Promise<Candidato | null>;

  /**
   * Obtener candidato por ID
   */
  obtenerPorId(id: string): Promise<Candidato | null>;

  /**
   * Actualizar información del candidato
   */
  actualizar(id: string, datos: Partial<Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>, session?: mongoose.ClientSession): Promise<Candidato>;

  /**
   * Verificar si existe candidato con correo
   */
  existePorCorreo(correo: string): Promise<boolean>;

  /**
   * Buscar candidatos por criterios de búsqueda
   */
  buscar(filtros: {
    nombres?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    lugarResidencia?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ candidatos: Candidato[]; total: number }>;

  /**
   * Eliminar candidato (solo si no tiene aplicaciones activas)
   */
  eliminar(id: string): Promise<void>;

  /**
   * Incrementar contador de totalAplicaciones del candidato
   */
  incrementarTotalAplicaciones(id: string, session?: mongoose.ClientSession): Promise<void>;

  /**
   * Incrementar contador de aplicacionesGanadas del candidato
   */
  incrementarAplicacionesGanadas(id: string, session?: mongoose.ClientSession): Promise<void>;

  /**
   * Inicializar estadísticas del candidato (totalAplicaciones = 1, aplicacionesGanadas = 0)
   */
  inicializarEstadisticas(id: string, session?: mongoose.ClientSession): Promise<void>;
}