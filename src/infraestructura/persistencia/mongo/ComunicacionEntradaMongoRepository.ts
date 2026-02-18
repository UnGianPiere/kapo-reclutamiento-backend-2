// ============================================================================
// REPOSITORIO COMUNICACION ENTRADA - Implementación MongoDB
// ============================================================================

import { ComunicacionEntradaModel } from './schemas/ComunicacionEntradaSchema';
import { IComunicacionEntradaRepository } from '../../../dominio/repositorios/IComunicacionEntradaRepository';
import {
  ComunicacionEntrada,
  CrearComunicacionEntradaInput,
  ActualizarComunicacionEntradaInput
} from '../../../dominio/entidades/ComunicacionEntrada';

export class ComunicacionEntradaMongoRepository implements IComunicacionEntradaRepository {
  async crear(input: CrearComunicacionEntradaInput): Promise<ComunicacionEntrada> {
    const documento = await ComunicacionEntradaModel.create(input);

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      llamadaConfirmada: documento.llamadaConfirmada,
      comunicacionConfirmada: documento.comunicacionConfirmada,
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async obtenerPorId(id: string): Promise<ComunicacionEntrada | null> {
    const documento = await ComunicacionEntradaModel.findById(id);

    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      llamadaConfirmada: documento.llamadaConfirmada,
      comunicacionConfirmada: documento.comunicacionConfirmada,
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async obtenerPorAplicacion(aplicacionCandidatoId: string): Promise<ComunicacionEntrada | null> {
    const documento = await ComunicacionEntradaModel.findOne({ aplicacionCandidatoId });

    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      llamadaConfirmada: documento.llamadaConfirmada,
      comunicacionConfirmada: documento.comunicacionConfirmada,
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async actualizar(id: string, input: ActualizarComunicacionEntradaInput): Promise<ComunicacionEntrada | null> {
    const documento = await ComunicacionEntradaModel.findByIdAndUpdate(
      id,
      input,
      { new: true, runValidators: true }
    );

    if (!documento) return null;

    return {
      id: documento._id.toString(),
      aplicacionCandidatoId: documento.aplicacionCandidatoId.toString(),
      candidatoId: documento.candidatoId.toString(),
      llamadaConfirmada: documento.llamadaConfirmada,
      comunicacionConfirmada: documento.comunicacionConfirmada,
      created_at: documento.created_at,
      updated_at: documento.updated_at
    };
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await ComunicacionEntradaModel.findByIdAndDelete(id);
    return !!resultado;
  }

  async existeParaAplicacion(aplicacionCandidatoId: string): Promise<boolean> {
    const count = await ComunicacionEntradaModel.countDocuments({ aplicacionCandidatoId });
    return count > 0;
  }
}
