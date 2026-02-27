// ============================================================================
// REPOSITORIO MONGODB ENTREVISTA REGULAR - Implementación de persistencia
// ============================================================================

import { EntrevistaRegularModel } from './schemas/EntrevistaRegularSchema';
import { IEntrevistaRegularRepository } from '../../../dominio/repositorios/IEntrevistaRegularRepository';
import {
  EntrevistaRegular,
  CrearEntrevistaRegularInput,
  ActualizarEntrevistaRegularInput,
  TipoEntrevista
} from '../../../dominio/entidades/EntrevistaRegular';

export class EntrevistaRegularMongoRepository implements IEntrevistaRegularRepository {
  async crear(input: CrearEntrevistaRegularInput): Promise<EntrevistaRegular> {
    const documento = new EntrevistaRegularModel(input);
    const savedDoc = await documento.save();

    return {
      id: savedDoc._id.toString(),
      aplicacionCandidatoId: savedDoc.aplicacionCandidatoId.toString(),
      candidatoId: savedDoc.candidatoId.toString(),
      tipo_entrevista: savedDoc.tipo_entrevista,
      modalidad: savedDoc.modalidad,
      fecha_entrevista: savedDoc.fecha_entrevista,
      hora_entrevista: savedDoc.hora_entrevista,
      correo_contacto: savedDoc.correo_contacto,
      entrevistador_id: savedDoc.entrevistador_id.toString(),
      entrevistador_nombre: savedDoc.entrevistador_nombre,
      ...(savedDoc.observaciones !== undefined ? { observaciones: savedDoc.observaciones } : {}),
      ...(savedDoc.resultado !== undefined ? { resultado: savedDoc.resultado } : {}),
      ...(savedDoc.archivo_sustento !== undefined ? { archivo_sustento: savedDoc.archivo_sustento } : {}),
      created_at: savedDoc.created_at,
      updated_at: savedDoc.updated_at
    };
  }

  async obtenerPorId(id: string): Promise<EntrevistaRegular | null> {
    const documento = await EntrevistaRegularModel.findById(id);
    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      tipo_entrevista: documento.tipo_entrevista,
      modalidad: documento.modalidad,
      fecha_entrevista: documento.fecha_entrevista,
      hora_entrevista: documento.hora_entrevista,
      correo_contacto: documento.correo_contacto,
      entrevistador_id: documento.entrevistador_id.toString(),
      entrevistador_nombre: documento.entrevistador_nombre,
      ...(documento.observaciones !== undefined ? { observaciones: documento.observaciones } : {}),
      ...(documento.resultado !== undefined ? { resultado: documento.resultado } : {}),
      ...(documento.archivo_sustento !== undefined ? { archivo_sustento: documento.archivo_sustento } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async obtenerPorAplicacionYTipo(aplicacionCandidatoId: string, tipo_entrevista: TipoEntrevista): Promise<EntrevistaRegular | null> {
    const documento = await EntrevistaRegularModel.findOne({
      aplicacionCandidatoId,
      tipo_entrevista
    });

    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      tipo_entrevista: documento.tipo_entrevista,
      modalidad: documento.modalidad,
      fecha_entrevista: documento.fecha_entrevista,
      hora_entrevista: documento.hora_entrevista,
      correo_contacto: documento.correo_contacto,
      entrevistador_id: documento.entrevistador_id.toString(),
      entrevistador_nombre: documento.entrevistador_nombre,
      ...(documento.observaciones !== undefined ? { observaciones: documento.observaciones } : {}),
      ...(documento.resultado !== undefined ? { resultado: documento.resultado } : {}),
      ...(documento.archivo_sustento !== undefined ? { archivo_sustento: documento.archivo_sustento } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async actualizar(id: string, input: ActualizarEntrevistaRegularInput): Promise<EntrevistaRegular | null> {
    const documento = await EntrevistaRegularModel.findByIdAndUpdate(
      id,
      { ...input, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      tipo_entrevista: documento.tipo_entrevista,
      modalidad: documento.modalidad,
      fecha_entrevista: documento.fecha_entrevista,
      hora_entrevista: documento.hora_entrevista,
      correo_contacto: documento.correo_contacto,
      entrevistador_id: documento.entrevistador_id.toString(),
      entrevistador_nombre: documento.entrevistador_nombre,
      ...(documento.observaciones !== undefined ? { observaciones: documento.observaciones } : {}),
      ...(documento.resultado !== undefined ? { resultado: documento.resultado } : {}),
      ...(documento.archivo_sustento !== undefined ? { archivo_sustento: documento.archivo_sustento } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async eliminar(id: string): Promise<boolean> {
    const result = await EntrevistaRegularModel.findByIdAndDelete(id);
    return !!result;
  }

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
    const query: any = {};

    if (filtros?.aplicacionCandidatoId) query.aplicacionCandidatoId = filtros.aplicacionCandidatoId;
    if (filtros?.candidatoId) query.candidatoId = filtros.candidatoId;
    if (filtros?.tipo_entrevista) query.tipo_entrevista = filtros.tipo_entrevista;
    if (filtros?.entrevistador_id) query.entrevistador_id = filtros.entrevistador_id;

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      query.fecha_entrevista = {};
      if (filtros.fechaDesde) query.fecha_entrevista.$gte = filtros.fechaDesde;
      if (filtros.fechaHasta) query.fecha_entrevista.$lte = filtros.fechaHasta;
    }

    const documentos = await EntrevistaRegularModel
      .find(query)
      .sort({ created_at: -1 })
      .limit(filtros?.limit || 50)
      .skip(filtros?.offset || 0);

    return documentos.map(documento => ({
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      tipo_entrevista: documento.tipo_entrevista,
      modalidad: documento.modalidad,
      fecha_entrevista: documento.fecha_entrevista,
      hora_entrevista: documento.hora_entrevista,
      correo_contacto: documento.correo_contacto,
      entrevistador_id: documento.entrevistador_id.toString(),
      entrevistador_nombre: documento.entrevistador_nombre,
      ...(documento.observaciones !== undefined ? { observaciones: documento.observaciones } : {}),
      ...(documento.resultado !== undefined ? { resultado: documento.resultado } : {}),
      ...(documento.archivo_sustento !== undefined ? { archivo_sustento: documento.archivo_sustento } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    }));
  }

  async contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    tipo_entrevista?: TipoEntrevista;
    entrevistador_id?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<number> {
    const query: any = {};

    if (filtros?.aplicacionCandidatoId) query.aplicacionCandidatoId = filtros.aplicacionCandidatoId;
    if (filtros?.candidatoId) query.candidatoId = filtros.candidatoId;
    if (filtros?.tipo_entrevista) query.tipo_entrevista = filtros.tipo_entrevista;
    if (filtros?.entrevistador_id) query.entrevistador_id = filtros.entrevistador_id;

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      query.fecha_entrevista = {};
      if (filtros.fechaDesde) query.fecha_entrevista.$gte = filtros.fechaDesde;
      if (filtros.fechaHasta) query.fecha_entrevista.$lte = filtros.fechaHasta;
    }

    return await EntrevistaRegularModel.countDocuments(query);
  }

  async existeParaAplicacionYTipo(aplicacionCandidatoId: string, tipo_entrevista: TipoEntrevista): Promise<boolean> {
    const count = await EntrevistaRegularModel.countDocuments({
      aplicacionCandidatoId,
      tipo_entrevista
    });
    return count > 0;
  }
}