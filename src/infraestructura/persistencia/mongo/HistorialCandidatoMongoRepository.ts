// ============================================================================
// REPOSITORIO MONGODB PARA HISTORIAL CANDIDATO
// ============================================================================

import { HistorialCandidatoModel } from './schemas/HistorialCandidatoSchema';
import { BaseMongoRepository } from './BaseMongoRepository';
import { IHistorialCandidatoRepository } from '../../../dominio/repositorios/IHistorialCandidatoRepository';
import { HistorialCandidato, CrearHistorialInput, HistorialFiltros } from '../../../dominio/entidades/HistorialCandidato';
import mongoose from 'mongoose';

/**
 * Repositorio MongoDB para la gestión del historial de candidatos
 * Implementa la interfaz IHistorialCandidatoRepository
 */
export class HistorialCandidatoMongoRepository extends BaseMongoRepository<HistorialCandidato> implements IHistorialCandidatoRepository {
  constructor() {
    super(HistorialCandidatoModel);
  }

  /**
   * Convierte documento de MongoDB a entidad de dominio
   */
  protected toDomain(doc: any): HistorialCandidato {
    return {
      id: doc._id.toString(),
      candidatoId: doc.candidatoId.toString(),
      aplicacionId: doc.aplicacionId.toString(),

      // Información del cambio
      estadoAnterior: doc.estadoAnterior,
      estadoNuevo: doc.estadoNuevo,
      tipoCambio: doc.tipoCambio,

      // Quién y cuándo
      realizadoPor: doc.realizadoPor.toString(),
      realizadoPorNombre: doc.realizadoPorNombre,
      fechaCambio: doc.fechaCambio,

      // Motivos y comentarios (opcionales)
      motivo: doc.motivo,
      comentarios: doc.comentarios,

      // Metadata adicional
      tiempoEnEstadoAnterior: doc.tiempoEnEstadoAnterior,
      etapaProceso: doc.etapaProceso,

      // Timestamps
      created_at: doc.created_at
    };
  }

  /**
   * Convierte entidad de dominio a documento de MongoDB
   */
  protected toPersistence(entity: CrearHistorialInput): any {
    return {
      candidatoId: entity.candidatoId,
      aplicacionId: entity.aplicacionId,
      estadoAnterior: entity.estadoAnterior,
      estadoNuevo: entity.estadoNuevo,
      tipoCambio: entity.tipoCambio,
      realizadoPor: entity.realizadoPor,
      realizadoPorNombre: entity.realizadoPorNombre,
      fechaCambio: entity.fechaCambio || new Date(),
      motivo: entity.motivo,
      comentarios: entity.comentarios,
      tiempoEnEstadoAnterior: entity.tiempoEnEstadoAnterior,
      etapaProceso: entity.etapaProceso
    };
  }

  /**
   * Crear nueva entrada en el historial
   */
  async crear(input: CrearHistorialInput): Promise<HistorialCandidato> {
    const doc = await this.model.create(this.toPersistence(input));
    return this.toDomain(doc);
  }

  /**
   * Obtener historial completo de una aplicación
   */
  async obtenerPorAplicacion(aplicacionId: string): Promise<HistorialCandidato[]> {
    const docs = await this.model
      .find({ aplicacionId })
      .sort({ fechaCambio: 1 }) // Orden cronológico
      .lean();

    return docs.map(doc => this.toDomain(doc));
  }

  /**
   * Obtener historial de un candidato
   */
  async obtenerPorCandidato(candidatoId: string): Promise<HistorialCandidato[]> {
    const docs = await this.model
      .find({ candidatoId })
      .sort({ fechaCambio: 1 }) // Orden cronológico
      .lean();

    return docs.map(doc => this.toDomain(doc));
  }

  /**
   * Obtener historial de una convocatoria (requiere join con aplicaciones)
   */
  async obtenerPorConvocatoria(convocatoriaId: string): Promise<HistorialCandidato[]> {
    // Primero obtener IDs de aplicaciones para esta convocatoria
    const AplicacionModel = this.model.db.model('AplicacionCandidato');
    const aplicaciones = await AplicacionModel.find({ convocatoriaId: new mongoose.Types.ObjectId(convocatoriaId) }).select('_id').lean();
    const aplicacionIds = aplicaciones.map(app => app._id);

    const docs = await this.model
      .find({ aplicacionId: { $in: aplicacionIds } })
      .sort({ fechaCambio: 1 })
      .lean();

    return docs.map(doc => this.toDomain(doc));
  }

  /**
   * Obtener entrada específica por ID
   */
  async obtenerPorId(id: string): Promise<HistorialCandidato | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Listar historial con filtros avanzados
   */
  async listar(filtros?: HistorialFiltros): Promise<{ historial: HistorialCandidato[]; total: number }> {
    const query: any = {};
    let sort: any = { fechaCambio: -1 }; // Más reciente primero por defecto

    if (filtros) {
      // Filtros básicos
      if (filtros.aplicacionId) query.aplicacionId = filtros.aplicacionId;
      if (filtros.candidatoId) query.candidatoId = filtros.candidatoId;
      if (filtros.realizadoPor) query.realizadoPor = filtros.realizadoPor;
      if (filtros.tipoCambio) query.tipoCambio = filtros.tipoCambio;
      if (filtros.estadoNuevo) query.estadoNuevo = filtros.estadoNuevo;

      // Filtros de fecha
      if (filtros.fechaDesde || filtros.fechaHasta) {
        query.fechaCambio = {};
        if (filtros.fechaDesde) query.fechaCambio.$gte = filtros.fechaDesde;
        if (filtros.fechaHasta) query.fechaCambio.$lte = filtros.fechaHasta;
      }
    }

    // Contar total sin paginación
    const total = await this.model.countDocuments(query);

    // Aplicar paginación si se especifica
    let queryBuilder = this.model.find(query).sort(sort);
    if (filtros?.limit) queryBuilder = queryBuilder.limit(filtros.limit);
    if (filtros?.offset) queryBuilder = queryBuilder.skip(filtros.offset);

    const docs = await queryBuilder.lean();
    const historial = docs.map(doc => this.toDomain(doc));

    return { historial, total };
  }

  /**
   * Obtener último cambio de estado para una aplicación
   */
  async obtenerUltimoCambioEstado(aplicacionId: string): Promise<HistorialCandidato | null> {
    const doc = await this.model
      .findOne({ aplicacionId })
      .sort({ fechaCambio: -1 })
      .lean();

    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Obtener último historial de una aplicación específica
   */
  async obtenerUltimoHistorialPorAplicacion(aplicacionId: string): Promise<HistorialCandidato | null> {
    const doc = await this.model
      .findOne({ aplicacionId })
      .sort({ _id: -1 }) // Ordenar por _id descendente (más reciente primero)
      .lean();

    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Limpiar historial antiguo (para mantenimiento)
   */
  async limpiarHistorico(fechaLimite: Date): Promise<number> {
    const result = await this.model.deleteMany({
      fechaCambio: { $lt: fechaLimite }
    });

    return result.deletedCount;
  }
}