// ============================================================================
// REPOSITORIO MONGODB - CONVOCATORIA (idempotente por requerimiento_personal_id)
// ============================================================================

import { ConvocatoriaModel } from './schemas/ConvocatoriaSchema';
import { IConvocatoriaRepository } from '../../../dominio/repositorios/IConvocatoriaRepository';
import { Convocatoria, RecibirConvocatoriaInput } from '../../../dominio/entidades/Convocatoria';

export class ConvocatoriaMongoRepository implements IConvocatoriaRepository {
  private toDomain(doc: any): Convocatoria {
    return {
      id: doc._id.toString(),
      requerimiento_personal_id: doc.requerimiento_personal_id,
      codigo_convocatoria: doc.codigo_convocatoria,
      tipo_requerimiento: doc.tipo_requerimiento,
      estado_convocatoria: doc.estado_convocatoria,
      cargo_nombre: doc.cargo_nombre,
      categoria_nombre: doc.categoria_nombre,
      especialidad_nombre: doc.especialidad_nombre,
      obra_nombre: doc.obra_nombre,
      empresa_nombre: doc.empresa_nombre,
      vacantes: doc.vacantes,
      prioridad: doc.prioridad,
      requisitos: doc.requisitos,
      cargo_categoria_especialidad_id: doc.cargo_categoria_especialidad_id,
      obra_id: doc.obra_id,
      empresa_id: doc.empresa_id,
      detalle_staff_snapshot: doc.detalle_staff_snapshot,
      link_formulario: doc.link_formulario,
      token_formulario: doc.token_formulario,
      fecha_creacion: doc.fecha_creacion,
      fecha_actualizacion: doc.fecha_actualizacion,
    };
  }

  async crearOActualizarPorRequerimientoPersonalId(input: RecibirConvocatoriaInput): Promise<Convocatoria> {
    const now = new Date();
    const payload = {
      codigo_convocatoria: input.codigo_convocatoria,
      tipo_requerimiento: input.tipo_requerimiento,
      estado_convocatoria: 'ACTIVA' as const,
      cargo_nombre: input.cargo_nombre,
      categoria_nombre: input.categoria_nombre,
      especialidad_nombre: input.especialidad_nombre,
      obra_nombre: input.obra_nombre,
      empresa_nombre: input.empresa_nombre,
      vacantes: input.vacantes,
      prioridad: input.prioridad,
      requisitos: input.requisitos,
      cargo_categoria_especialidad_id: input.cargo_categoria_especialidad_id,
      obra_id: input.obra_id,
      empresa_id: input.empresa_id,
      detalle_staff_snapshot: input.detalle_staff_snapshot,
      fecha_actualizacion: now,
    };

    const doc = await ConvocatoriaModel.findOneAndUpdate(
      { requerimiento_personal_id: input.requerimiento_personal_id },
      { $set: payload, $setOnInsert: { requerimiento_personal_id: input.requerimiento_personal_id, fecha_creacion: now } },
      { new: true, upsert: true, runValidators: true }
    );
    return this.toDomain(doc);
  }

  async findByRequerimientoPersonalId(requerimientoPersonalId: string): Promise<Convocatoria | null> {
    const doc = await ConvocatoriaModel.findOne({ requerimiento_personal_id: requerimientoPersonalId });
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<Convocatoria | null> {
    const doc = await ConvocatoriaModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async list(limit: number = 50, offset: number = 0): Promise<Convocatoria[]> {
    const docs = await ConvocatoriaModel.find()
      .sort({ fecha_creacion: -1 })
      .skip(offset)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }
}
