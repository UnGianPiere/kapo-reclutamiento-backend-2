// ============================================================================
// REPOSITORIO MONGODB PARA CANDIDATOS
// ============================================================================

import { CandidatoModel } from './schemas/CandidatoSchema';
import { BaseMongoRepository } from './BaseMongoRepository';
import { ICandidatoRepository } from '../../../dominio/repositorios/ICandidatoRepository';
import { Candidato } from '../../../dominio/entidades/Candidato';
import mongoose from 'mongoose';

/**
 * Repositorio MongoDB para la gestión de candidatos
 * Implementa la interfaz ICandidatoRepository
 */
export class CandidatoMongoRepository extends BaseMongoRepository<Candidato> implements ICandidatoRepository {
  constructor() {
    super(CandidatoModel);
  }

  /**
   * Convierte documento de MongoDB a entidad de dominio
   */
  protected toDomain(doc: any): Candidato {
    const candidato: Candidato = {
      id: doc._id.toString(),
      dni: doc.dni,
      nombres: doc.nombres,
      apellidoPaterno: doc.apellidoPaterno,
      apellidoMaterno: doc.apellidoMaterno,
      correo: doc.correo,
      telefono: doc.telefono,
      curriculumUrl: doc.curriculumUrl,
      fechaCreacion: doc.createdAt,
      fechaActualizacion: doc.updatedAt
    };

    if (doc.lugarResidencia !== undefined) {
      candidato.lugarResidencia = doc.lugarResidencia;
    }

    return candidato;
  }

  /**
   * Crear un nuevo candidato
   */
  async crear(candidato: Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'>, session?: mongoose.ClientSession): Promise<Candidato> {
    console.log('CandidatoMongoRepository.crear - candidato input:', candidato);

    // Crear documento usando new Model().save() para mejor compatibilidad con sessions
    const newDoc = new this.model(candidato);
    const doc = await newDoc.save(session ? { session } : undefined);

    console.log('CandidatoMongoRepository.crear - doc created:', doc);
    const result = this.toDomain(doc);
    console.log('CandidatoMongoRepository.crear - result:', result);
    return result;
  }

  /**
   * Buscar candidato por DNI (único)
   */
  async buscarPorDNI(dni: string): Promise<Candidato | null> {
    const doc = await CandidatoModel.findOne({ dni });
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Buscar candidato por correo (único)
   */
  async buscarPorCorreo(correo: string): Promise<Candidato | null> {
    const doc = await CandidatoModel.findOne({ correo: correo.toLowerCase() });
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Buscar candidato por teléfono
   */
  async buscarPorTelefono(telefono: string): Promise<Candidato | null> {
    const doc = await CandidatoModel.findOne({ telefono });
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Obtener candidato por ID
   */
  async obtenerPorId(id: string): Promise<Candidato | null> {
    const doc = await CandidatoModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Actualizar información del candidato
   */
  async actualizar(id: string, datos: Partial<Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>, session?: mongoose.ClientSession): Promise<Candidato> {
    // Buscar el documento existente
    const existingDoc = await CandidatoModel.findById(id).session(session || null);
    if (!existingDoc) {
      throw new Error(`Candidato con ID ${id} no encontrado`);
    }

    // Actualizar campos
    if (datos.dni !== undefined) existingDoc.dni = datos.dni;
    if (datos.nombres !== undefined) existingDoc.nombres = datos.nombres;
    if (datos.apellidoPaterno !== undefined) existingDoc.apellidoPaterno = datos.apellidoPaterno;
    if (datos.apellidoMaterno !== undefined) existingDoc.apellidoMaterno = datos.apellidoMaterno;
    if (datos.correo !== undefined) existingDoc.correo = datos.correo.toLowerCase();
    if (datos.telefono !== undefined) existingDoc.telefono = datos.telefono;
    if (datos.lugarResidencia !== undefined) existingDoc.lugarResidencia = datos.lugarResidencia;
    if (datos.curriculumUrl !== undefined) existingDoc.curriculumUrl = datos.curriculumUrl;

    // Guardar con session
    const doc = await existingDoc.save(session ? { session } : undefined);
    return this.toDomain(doc);
  }

  /**
   * Verificar si existe candidato con correo
   */
  async existePorCorreo(correo: string): Promise<boolean> {
    const count = await CandidatoModel.countDocuments({ correo: correo.toLowerCase() });
    return count > 0;
  }

  /**
   * Buscar candidatos por criterios de búsqueda
   */
  async buscar(filtros: {
    nombres?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    lugarResidencia?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ candidatos: Candidato[]; total: number }> {
    const query: any = {};

    if (filtros.nombres) {
      query.nombres = { $regex: filtros.nombres, $options: 'i' };
    }
    if (filtros.apellidos) {
      query.$or = [
        { apellidoPaterno: { $regex: filtros.apellidos, $options: 'i' } },
        { apellidoMaterno: { $regex: filtros.apellidos, $options: 'i' } }
      ];
    }
    if (filtros.correo) {
      query.correo = { $regex: filtros.correo, $options: 'i' };
    }
    if (filtros.telefono) {
      query.telefono = { $regex: filtros.telefono, $options: 'i' };
    }
    if (filtros.lugarResidencia) {
      query.lugarResidencia = { $regex: filtros.lugarResidencia, $options: 'i' };
    }

    const limit = filtros.limit || 50;
    const offset = filtros.offset || 0;

    const [docs, total] = await Promise.all([
      CandidatoModel.find(query).limit(limit).skip(offset).sort({ createdAt: -1 }),
      CandidatoModel.countDocuments(query)
    ]);

    const candidatos = docs.map(doc => this.toDomain(doc));

    return { candidatos, total };
  }

  /**
   * Eliminar candidato (solo si no tiene aplicaciones activas)
   */
  async eliminar(id: string): Promise<void> {
    await this.delete(id);
  }
}