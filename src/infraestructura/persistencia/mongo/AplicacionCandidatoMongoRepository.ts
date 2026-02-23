// ============================================================================
// REPOSITORIO MONGODB PARA APLICACIONES DE CANDIDATOS
// ============================================================================

import { AplicacionCandidatoModel } from './schemas/AplicacionCandidatoSchema';
import { BaseMongoRepository } from './BaseMongoRepository';
import { IAplicacionCandidatoRepository } from '../../../dominio/repositorios/IAplicacionCandidatoRepository';
import { AplicacionCandidato, CrearAplicacionInput, ActualizarAplicacionInput } from '../../../dominio/entidades/AplicacionCandidato';
import { EstadoKanban } from '../../../dominio/entidades/EstadoKanban';
import mongoose from 'mongoose';

/**
 * Repositorio MongoDB para la gestión de aplicaciones de candidatos
 * Implementa la interfaz IAplicacionCandidatoRepository
*/
export class AplicacionCandidatoMongoRepository extends BaseMongoRepository<AplicacionCandidato> implements IAplicacionCandidatoRepository {
  constructor() {
    super(AplicacionCandidatoModel);
  }

  /**
   * Convierte documento de MongoDB a entidad de dominio
   */
  protected toDomain(doc: any): AplicacionCandidato {
    const domainEntity = {
      id: doc._id.toString(),
      candidatoId: doc.candidatoId.toString(),
      convocatoriaId: doc.convocatoriaId.toString(),

      respuestasFormulario: doc.respuestasFormulario || {},

      estadoKanban: doc.estadoKanban,

      aniosExperienciaPuesto: doc.aniosExperienciaPuesto,
      aniosExperienciaGeneral: doc.aniosExperienciaGeneral,
      medioConvocatoria: doc.medioConvocatoria,
      pretensionEconomica: doc.pretensionEconomica,
      curriculumUrl: doc.curriculumUrl,

      fechaAplicacion: doc.fechaAplicacion,
      aplicadoPor: doc.aplicadoPor,

      ordenPrioridad: doc.ordenPrioridad,
      fechaExpiracionPosibles: doc.fechaExpiracionPosibles,

      posibleDuplicado: doc.posibleDuplicado,
      candidatoSimilarId: doc.candidatoSimilarId,
      similitudPorcentaje: doc.similitudPorcentaje,
      duplicadoRevisado: doc.duplicadoRevisado,

      esRepostulacion: doc.esRepostulacion,
      esPosibleCandidatoActivado: doc.esPosibleCandidatoActivado,
      aplicacionPrincipalRechazadaId: doc.aplicacionPrincipalRechazadaId,

      fechaActualizacion: doc.fechaActualizacion || doc.fechaAplicacion,
      tiempoEnEstadoDias: doc.tiempoEnEstadoDias || 0
    };
    return domainEntity;
  }

  /**
   * Convierte documento de agregación a entidad de dominio
   * Sin campos poblados - GraphQL resuelve relaciones por separado
   */
  private toDomainFromAggregate(doc: any): AplicacionCandidato {
    return {
      id: doc._id.toString(),
      candidatoId: doc.candidatoId.toString(),
      convocatoriaId: doc.convocatoriaId.toString(),

      respuestasFormulario: doc.respuestasFormulario || {},

      estadoKanban: doc.estadoKanban,

      aniosExperienciaPuesto: doc.aniosExperienciaPuesto,
      aniosExperienciaGeneral: doc.aniosExperienciaGeneral,
      medioConvocatoria: doc.medioConvocatoria,
      pretensionEconomica: doc.pretensionEconomica,
      curriculumUrl: doc.curriculumUrl,

      fechaAplicacion: doc.fechaAplicacion,
      aplicadoPor: doc.aplicadoPor,

      ordenPrioridad: doc.ordenPrioridad,
      fechaExpiracionPosibles: doc.fechaExpiracionPosibles,

      posibleDuplicado: doc.posibleDuplicado,
      candidatoSimilarId: doc.candidatoSimilarId,
      similitudPorcentaje: doc.similitudPorcentaje,
      duplicadoRevisado: doc.duplicadoRevisado,

      esRepostulacion: doc.esRepostulacion,
      esPosibleCandidatoActivado: doc.esPosibleCandidatoActivado,
      aplicacionPrincipalRechazadaId: doc.aplicacionPrincipalRechazadaId,

      fechaActualizacion: doc.fechaActualizacion || doc.fechaAplicacion,
      tiempoEnEstadoDias: doc.tiempoEnEstadoDias || 0
    };
  }

  /**
   * Crear nueva aplicación
   */
  async crear(input: CrearAplicacionInput, session?: mongoose.ClientSession): Promise<AplicacionCandidato> {
    // Convertir strings a ObjectIds para Mongoose
    const candidatoObjectId = new mongoose.Types.ObjectId(input.candidatoId);
    const convocatoriaObjectId = new mongoose.Types.ObjectId(input.convocatoriaId);

    // Crear el documento directamente con ObjectIds (para el schema)
    const aplicacionData: any = {
      candidatoId: candidatoObjectId,
      convocatoriaId: convocatoriaObjectId,
      respuestasFormulario: input.respuestasFormulario || {},
      aplicadoPor: input.aplicadoPor || 'CANDIDATO',
      estadoKanban: EstadoKanban.CVS_RECIBIDOS,
      aniosExperienciaPuesto: input.aniosExperienciaPuesto || 0,
      aniosExperienciaGeneral: input.aniosExperienciaGeneral !== undefined ? input.aniosExperienciaGeneral : 0,
      medioConvocatoria: input.medioConvocatoria !== undefined ? input.medioConvocatoria : 'Otro',
      pretensionEconomica: input.pretensionEconomica || 0,
      curriculumUrl: input.curriculumUrl || '',
      fechaAplicacion: new Date(),
      posibleDuplicado: false,
      duplicadoRevisado: false,
      esRepostulacion: false,
      esPosibleCandidatoActivado: false
    };

    // Crear documento usando new Model().save() para mejor compatibilidad con sessions
    const newDoc = new this.model(aplicacionData);
    const doc = await newDoc.save(session ? { session } : undefined);
    return this.toDomain(doc);
  }

  /**
   * Obtener aplicación por ID
   */
  async obtenerPorId(id: string): Promise<AplicacionCandidato | null> {
    return await this.findById(id);
  }

  /**
   * Obtener aplicaciones por candidato
   */
  async obtenerPorCandidato(candidatoId: string): Promise<AplicacionCandidato[]> {
    const docs = await AplicacionCandidatoModel.find({ candidatoId }).sort({ fechaAplicacion: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  /**
   * Obtener aplicaciones por convocatoria
   */
  async obtenerPorConvocatoria(convocatoriaId: string): Promise<AplicacionCandidato[]> {
    const docs = await AplicacionCandidatoModel.find({ convocatoriaId: new mongoose.Types.ObjectId(convocatoriaId) }).sort({ fechaAplicacion: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  /**
   * Obtener aplicación específica de candidato a convocatoria
   */
  async obtenerPorCandidatoYConvocatoria(candidatoId: string, convocatoriaId: string): Promise<AplicacionCandidato | null> {
    const doc = await AplicacionCandidatoModel.findOne({ candidatoId, convocatoriaId: new mongoose.Types.ObjectId(convocatoriaId) });
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Actualizar aplicación
   */
  async actualizar(id: string, input: ActualizarAplicacionInput): Promise<AplicacionCandidato> {
    const updateData: any = {};

    if (input.aniosExperienciaPuesto !== undefined) updateData.aniosExperienciaPuesto = input.aniosExperienciaPuesto;
    if (input.aniosExperienciaGeneral !== undefined) updateData.aniosExperienciaGeneral = input.aniosExperienciaGeneral;
    if (input.medioConvocatoria !== undefined) updateData.medioConvocatoria = input.medioConvocatoria;
    if (input.pretensionEconomica !== undefined) updateData.pretensionEconomica = input.pretensionEconomica;
    if (input.curriculumUrl !== undefined) updateData.curriculumUrl = input.curriculumUrl;
    if (input.respuestasFormulario !== undefined) updateData.respuestasFormulario = input.respuestasFormulario;
    if (input.estadoKanban !== undefined) updateData.estadoKanban = input.estadoKanban;
    if (input.ordenPrioridad !== undefined) updateData.ordenPrioridad = input.ordenPrioridad;
    if (input.fechaExpiracionPosibles !== undefined) updateData.fechaExpiracionPosibles = input.fechaExpiracionPosibles;
    if (input.posibleDuplicado !== undefined) updateData.posibleDuplicado = input.posibleDuplicado;
    if (input.candidatoSimilarId !== undefined) updateData.candidatoSimilarId = input.candidatoSimilarId;
    if (input.similitudPorcentaje !== undefined) updateData.similitudPorcentaje = input.similitudPorcentaje;
    if (input.duplicadoRevisado !== undefined) updateData.duplicadoRevisado = input.duplicadoRevisado;
    if (input.esRepostulacion !== undefined) updateData.esRepostulacion = input.esRepostulacion;
    if (input.esPosibleCandidatoActivado !== undefined) updateData.esPosibleCandidatoActivado = input.esPosibleCandidatoActivado;
    if (input.aplicacionPrincipalRechazadaId !== undefined) updateData.aplicacionPrincipalRechazadaId = input.aplicacionPrincipalRechazadaId;
    if (input.convocatoriaId !== undefined) updateData.convocatoriaId = new mongoose.Types.ObjectId(input.convocatoriaId);

    const aplicacion = await this.update(id, updateData);
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${id} no encontrada`);
    }
    return aplicacion;
  }

  /**
   * Cambiar estado de aplicación en el kanban
   */
  async cambiarEstadoKanban(id: string, estadoKanban: EstadoKanban): Promise<AplicacionCandidato> {
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de aplicación inválido: ${id}`);
    }

    const aplicacion = await this.update(id, { estadoKanban });
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${id} no encontrada`);
    }
    return aplicacion;
  }

  /**
   * Listar aplicaciones con filtros
   */
  async listar(filtros?: {
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
  }): Promise<{ aplicaciones: AplicacionCandidato[]; total: number }> {
    const query: any = {};

    // Aplicar filtros globales
    if (filtros?.estadoKanban) query.estadoKanban = filtros.estadoKanban;
    if (filtros?.candidatoId) query.candidatoId = filtros.candidatoId;
    // Convertir convocatoriaId string a ObjectId para filtrar correctamente
    if (filtros?.convocatoriaId) query.convocatoriaId = new mongoose.Types.ObjectId(filtros.convocatoriaId);
    if (filtros?.ordenPrioridad) query.ordenPrioridad = filtros.ordenPrioridad;
    if (filtros?.aplicadoPor) query.aplicadoPor = filtros.aplicadoPor;
    if (filtros?.posibleDuplicado !== undefined) query.posibleDuplicado = filtros.posibleDuplicado;
    if (filtros?.duplicadoRevisado !== undefined) query.duplicadoRevisado = filtros.duplicadoRevisado;

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      query.fechaAplicacion = {};
      if (filtros.fechaDesde) query.fechaAplicacion.$gte = filtros.fechaDesde;
      if (filtros.fechaHasta) query.fechaAplicacion.$lte = filtros.fechaHasta;
    }

    const limit = filtros?.limit || 20; // Reducido a 20 para kanban
    const offset = filtros?.offset || 0;

    // Pipeline de agregación para ordenamiento inteligente por convocatoria
    const pipeline = [
      { $match: query },
      // Agregar campo numérico de convocatoria para ordenamiento
      {
        $addFields: {
          convocatoria_num: {
            $toInt: {
              $arrayElemAt: [
                { $split: [{ $toString: "$convocatoriaId" }, "-"] },
                1
              ]
            }
          }
        }
      },
      // Ordenamiento inteligente:
      // 1. Aplicaciones más recientes primero (por fecha de aplicación)
      // 2. Desempate por fecha de actualización
      // 3. Desempate final por ID
      {
        $sort: {
          "updatedAt": -1 as 1 | -1,          // Desempate por actualización
          "_id": -1 as 1 | -1                 // Desempate final por ID
        }
      },
      { $skip: offset },
      { $limit: limit }
      // SIN lookup - GraphQL resuelve las relaciones por separado
    ];

    // Ejecutar consulta y conteo en paralelo
    const [docs, total] = await Promise.all([
      AplicacionCandidatoModel.aggregate(pipeline),
      AplicacionCandidatoModel.countDocuments(query)
    ]);

    // Convertir documentos agregados a entidades de dominio
    const aplicaciones = docs.map(doc => this.toDomainFromAggregate(doc));

    return { aplicaciones, total };
  }

  /**
   * Verificar si candidato ya aplicó a convocatoria
   */
  async existeAplicacion(candidatoId: string, convocatoriaId: string): Promise<boolean> {
    const count = await AplicacionCandidatoModel.countDocuments({ candidatoId, convocatoriaId: new mongoose.Types.ObjectId(convocatoriaId) });
    return count > 0;
  }

  /**
   * Eliminar aplicación
   */
  async eliminar(id: string): Promise<void> {
    await this.delete(id);
  }

  /**
   * Obtener estadísticas por convocatoria
   */
  async obtenerEstadisticasPorConvocatoria(convocatoriaId: string): Promise<{
    total: number;
    porEstadoKanban: Record<EstadoKanban, number>;
    porPosiblesCandidatos: number;
    duplicadosPendientes: number;
  }> {
    const pipeline = [
      { $match: { convocatoriaId: this.toObjectId(convocatoriaId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          porEstadoKanban: {
            $push: '$estadoKanban'
          },
          porPosiblesCandidatos: {
            $sum: { $cond: [{ $eq: ['$estadoKanban', EstadoKanban.POSIBLES_CANDIDATOS] }, 1, 0] }
          },
          duplicadosPendientes: {
            $sum: { $cond: [{ $and: ['$posibleDuplicado', { $ne: ['$duplicadoRevisado', true] }] }, 1, 0] }
          }
        }
      }
    ];

    const result = await AplicacionCandidatoModel.aggregate(pipeline);

    if (result.length === 0) {
      return {
        total: 0,
        porEstadoKanban: {} as Record<EstadoKanban, number>,
        porPosiblesCandidatos: 0,
        duplicadosPendientes: 0
      };
    }

    const stats = result[0];

    // Contar por estado
    const porEstadoKanban: Record<EstadoKanban, number> = {} as Record<EstadoKanban, number>;
    Object.values(EstadoKanban).forEach(estado => {
      porEstadoKanban[estado] = 0;
    });

    stats.porEstadoKanban.forEach((estado: EstadoKanban) => {
      porEstadoKanban[estado] = (porEstadoKanban[estado] || 0) + 1;
    });

    return {
      total: stats.total,
      porEstadoKanban,
      porPosiblesCandidatos: stats.porPosiblesCandidatos,
      duplicadosPendientes: stats.duplicadosPendientes
    };
  }

  /**
   * Helper para convertir string a ObjectId
   */
  private toObjectId(id: string): any {
    return new mongoose.Types.ObjectId(id);
  }
}