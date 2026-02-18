// ============================================================================
// REPOSITORIO MONGODB REFERENCIA - Implementación de persistencia
// ============================================================================

import { ReferenciaModel } from './schemas/ReferenciaSchema';
import { IReferenciaRepository } from '../../../dominio/repositorios/IReferenciaRepository';
import {
  Referencia,
  CrearReferenciaInput,
  ActualizarReferenciaInput
} from '../../../dominio/entidades/Referencia';

export class ReferenciaMongoRepository implements IReferenciaRepository {
  async crear(input: CrearReferenciaInput): Promise<Referencia> {
    const documento = new ReferenciaModel(input);
    const savedDoc = await documento.save();

    return {
      id: savedDoc._id.toString(),
      aplicacionCandidatoId: savedDoc.aplicacionCandidatoId.toString(),
      candidatoId: savedDoc.candidatoId.toString(),
      numero_telefono: savedDoc.numero_telefono,
      nombresyapellidos: savedDoc.nombresyapellidos,
      detalles: savedDoc.detalles,
      empresa: savedDoc.empresa,
      comentarios: savedDoc.comentarios,
      ...(savedDoc.archivosurl !== undefined ? { archivosurl: savedDoc.archivosurl } : {}),
      created_at: savedDoc.created_at,
      updated_at: savedDoc.updated_at
    };
  }

  async obtenerPorId(id: string): Promise<Referencia | null> {
    const documento = await ReferenciaModel.findById(id);
    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      numero_telefono: documento.numero_telefono,
      nombresyapellidos: documento.nombresyapellidos,
      detalles: documento.detalles,
      empresa: documento.empresa,
      comentarios: documento.comentarios,
      ...(documento.archivosurl !== undefined ? { archivosurl: documento.archivosurl } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async actualizar(id: string, input: ActualizarReferenciaInput): Promise<Referencia | null> {
    const documento = await ReferenciaModel.findByIdAndUpdate(
      id,
      { ...input, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      numero_telefono: documento.numero_telefono,
      nombresyapellidos: documento.nombresyapellidos,
      detalles: documento.detalles,
      empresa: documento.empresa,
      comentarios: documento.comentarios,
      ...(documento.archivosurl !== undefined ? { archivosurl: documento.archivosurl } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async eliminar(id: string): Promise<boolean> {
    const result = await ReferenciaModel.findByIdAndDelete(id);
    return !!result;
  }

  async listar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    empresa?: string;
    limit?: number;
    offset?: number;
  }): Promise<Referencia[]> {
    const query: any = {};

    if (filtros?.aplicacionCandidatoId) {
      query.aplicacionCandidatoId = filtros.aplicacionCandidatoId;
    }

    if (filtros?.candidatoId) {
      query.candidatoId = filtros.candidatoId;
    }

    if (filtros?.empresa) {
      query.empresa = { $regex: filtros.empresa, $options: 'i' };
    }

    const documentos = await ReferenciaModel
      .find(query)
      .sort({ created_at: -1 })
      .skip(filtros?.offset || 0)
      .limit(filtros?.limit || 100);

    return documentos.map(documento => ({
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      numero_telefono: documento.numero_telefono,
      nombresyapellidos: documento.nombresyapellidos,
      detalles: documento.detalles,
      empresa: documento.empresa,
      comentarios: documento.comentarios,
      ...(documento.archivosurl !== undefined ? { archivosurl: documento.archivosurl } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    }));
  }

  async contar(filtros?: {
    aplicacionCandidatoId?: string;
    candidatoId?: string;
    empresa?: string;
  }): Promise<number> {
    const query: any = {};

    if (filtros?.aplicacionCandidatoId) {
      query.aplicacionCandidatoId = filtros.aplicacionCandidatoId;
    }

    if (filtros?.candidatoId) {
      query.candidatoId = filtros.candidatoId;
    }

    if (filtros?.empresa) {
      query.empresa = { $regex: filtros.empresa, $options: 'i' };
    }

    return await ReferenciaModel.countDocuments(query);
  }

  async listarPorAplicacion(aplicacionCandidatoId: string): Promise<Referencia[]> {
    const documentos = await ReferenciaModel
      .find({ aplicacionCandidatoId })
      .sort({ created_at: -1 });

    return documentos.map(documento => ({
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      numero_telefono: documento.numero_telefono,
      nombresyapellidos: documento.nombresyapellidos,
      detalles: documento.detalles,
      empresa: documento.empresa,
      comentarios: documento.comentarios,
      ...(documento.archivosurl !== undefined ? { archivosurl: documento.archivosurl } : {}),
      created_at: documento.created_at,
      updated_at: documento.updated_at
    }));
  }
}