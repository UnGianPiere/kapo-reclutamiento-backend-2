// ============================================================================
// REPOSITORIO FORMULARIO CONFIG - Implementación MongoDB
// ============================================================================

import { FormularioConfigSchema } from './schemas/FormularioConfigSchema';
import { IFormularioConfigRepository } from '../../../dominio/repositorios/IFormularioConfigRepository';
import { FormularioConfig, CrearFormularioConfigInput, ActualizarFormularioConfigInput, CampoFormularioInput, CAMPOS_REQUERIDOS_BASE } from '../../../dominio/entidades/FormularioConfig';
import mongoose from 'mongoose';

// Crear el modelo
const FormularioConfigModel = mongoose.model<FormularioConfig>('FormularioConfig', FormularioConfigSchema);

export class FormularioConfigMongoRepository implements IFormularioConfigRepository {
  constructor() {}

  async crear(input: CrearFormularioConfigInput): Promise<FormularioConfig> {
    const campos = input.campos || CAMPOS_REQUERIDOS_BASE;

    const documento = new FormularioConfigModel({
      convocatoriaId: input.convocatoriaId,
      titulo: input.titulo || 'Formulario de Postulación',
      descripcion: input.descripcion,
      campos,
      estado: 'BORRADOR',
      creadoPor: input.creadoPor,
      version: 1
    });

    const resultado = await documento.save();
    return this.mapearADominio(resultado);
  }

  async crearConId(id: string, input: CrearFormularioConfigInput): Promise<FormularioConfig> {
    const campos = input.campos || CAMPOS_REQUERIDOS_BASE;

    const documento = new FormularioConfigModel({
      formularioId: id, // Usar el campo 'formularioId' para el UUID
      convocatoriaId: input.convocatoriaId,
      titulo: input.titulo || 'Formulario de Postulación',
      descripcion: input.descripcion,
      campos,
      estado: input.estado || 'ACTIVO',
      urlPublico: input.urlPublico,
      tokenJwt: input.tokenJwt,
      fechaPublicacion: input.fechaPublicacion,
      fechaExpiracion: input.fechaExpiracion,
      creadoPor: input.creadoPor || '507f1f77bcf86cd799439011', // ID dummy temporal
      version: 1
    });

    const resultado = await documento.save();
    return this.mapearADominio(resultado);
  }

  async obtenerPorConvocatoriaId(convocatoriaId: string): Promise<FormularioConfig | null> {
    const documento = await FormularioConfigModel.findOne({ convocatoriaId: new mongoose.Types.ObjectId(convocatoriaId) }).exec();
    return documento ? this.mapearADominio(documento) : null;
  }

  async obtenerPorFormularioId(formularioId: string): Promise<FormularioConfig | null> {
    const documento = await FormularioConfigModel.findOne({ formularioId: formularioId }).exec();
    return documento ? this.mapearADominio(documento) : null;
  }

  async obtenerPorId(id: string): Promise<FormularioConfig | null> {
    // Buscar por formularioId (UUID) en lugar de _id (ObjectId)
    const documento = await FormularioConfigModel.findOne({ formularioId: id }).exec();
    return documento ? this.mapearADominio(documento) : null;
  }

  async actualizar(id: string, input: ActualizarFormularioConfigInput): Promise<FormularioConfig> {
    const updateData: any = {};

    if (input.titulo !== undefined) updateData.titulo = input.titulo;
    if (input.descripcion !== undefined) updateData.descripcion = input.descripcion;
    if (input.campos !== undefined) updateData.campos = input.campos;
    if (input.estado !== undefined) updateData.estado = input.estado;
    if (input.urlPublico !== undefined) updateData.urlPublico = input.urlPublico;
    if (input.tokenJwt !== undefined) updateData.tokenJwt = input.tokenJwt;
    if (input.fechaPublicacion !== undefined) updateData.fechaPublicacion = input.fechaPublicacion;
    if (input.fechaExpiracion !== undefined) updateData.fechaExpiracion = input.fechaExpiracion;

    const documento = await FormularioConfigModel.findOneAndUpdate(
      { formularioId: id },
      updateData,
      { new: true, runValidators: true }
    ).exec();

    if (!documento) {
      throw new Error('Configuración de formulario no encontrada');
    }

    return this.mapearADominio(documento);
  }

  async cambiarEstado(id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<FormularioConfig> {
    const documento = await FormularioConfigModel.findOneAndUpdate(
      { formularioId: id },
      { estado },
      { new: true, runValidators: true }
    ).exec();

    if (!documento) {
      throw new Error('Configuración de formulario no encontrada');
    }

    return this.mapearADominio(documento);
  }

  async agregarCampo(id: string, campo: CampoFormularioInput): Promise<FormularioConfig> {
    const documento = await FormularioConfigModel.findOne({ formularioId: id }).exec();
    if (!documento) {
      throw new Error('Configuración de formulario no encontrada');
    }

    documento.campos.push(campo as any);
    await documento.save();

    return this.mapearADominio(documento);
  }

  async actualizarCampo(id: string, campoId: string, campo: Partial<CampoFormularioInput>): Promise<FormularioConfig> {
    const documento = await FormularioConfigModel.findOneAndUpdate(
      { formularioId: id, 'campos.id': campoId },
      {
        $set: Object.keys(campo).reduce((acc, key) => {
          acc[`campos.$.${key}`] = campo[key as keyof CampoFormularioInput];
          return acc;
        }, {} as any)
      },
      { new: true, runValidators: true }
    ).exec();

    if (!documento) {
      throw new Error('Campo no encontrado');
    }

    return this.mapearADominio(documento);
  }

  async eliminarCampo(id: string, campoId: string): Promise<FormularioConfig> {
    const documento = await FormularioConfigModel.findOneAndUpdate(
      { formularioId: id },
      { $pull: { campos: { id: campoId } } },
      { new: true, runValidators: true }
    ).exec();

    if (!documento) {
      throw new Error('Configuración de formulario no encontrada');
    }

    return this.mapearADominio(documento);
  }

  async reordenarCampos(id: string, nuevosOrdenes: { campoId: string; orden: number }[]): Promise<FormularioConfig> {
    const documento = await FormularioConfigModel.findOne({ formularioId: id }).exec();
    if (!documento) {
      throw new Error('Configuración de formulario no encontrada');
    }

    // Actualizar orden de cada campo
    nuevosOrdenes.forEach(({ campoId, orden }: { campoId: string; orden: number }) => {
      const campo = documento.campos.find(c => c.id === campoId);
      if (campo) {
        campo.orden = orden;
      }
    });

    // Reordenar array por orden
    documento.campos.sort((a: any, b: any) => a.orden - b.orden);

    await documento.save();
    return this.mapearADominio(documento);
  }

  async eliminar(id: string): Promise<void> {
    const resultado = await FormularioConfigModel.findOneAndDelete({ formularioId: id }).exec();
    if (!resultado) {
      throw new Error('Configuración de formulario no encontrada');
    }
  }

  async listar(filtros?: {
    estado?: string;
    creadoPor?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ configuraciones: FormularioConfig[]; total: number }> {
    const query: any = {};

    if (filtros?.estado) query.estado = filtros.estado;
    if (filtros?.creadoPor) query.creadoPor = filtros.creadoPor;

    const total = await FormularioConfigModel.countDocuments(query).exec();

    const documentos = await FormularioConfigModel
      .find(query)
      .sort({ fechaCreacion: -1 })
      .limit(filtros?.limit || 50)
      .skip(filtros?.offset || 0)
      .exec();

    const configuraciones = documentos.map((doc: any) => this.mapearADominio(doc));

    return { configuraciones, total };
  }

  async existeParaConvocatoria(convocatoriaId: string): Promise<boolean> {
    const count = await FormularioConfigModel.countDocuments({ convocatoriaId: new mongoose.Types.ObjectId(convocatoriaId) }).exec();
    return count > 0;
  }

  private mapearADominio(documento: any): FormularioConfig {
    return {
      id: documento.formularioId, // Usar el campo 'formularioId' (UUID) que guardamos
      convocatoriaId: documento.convocatoriaId.toString(),
      titulo: documento.titulo,
      descripcion: documento.descripcion,
      campos: documento.campos,
      estado: documento.estado,
      urlPublico: documento.urlPublico,
      tokenJwt: documento.tokenJwt,
      fechaPublicacion: documento.fechaPublicacion,
      fechaExpiracion: documento.fechaExpiracion,
      creadoPor: documento.creadoPor.toString(),
      fechaCreacion: documento.fechaCreacion,
      fechaModificacion: documento.fechaModificacion,
      version: documento.version
    };
  }
}