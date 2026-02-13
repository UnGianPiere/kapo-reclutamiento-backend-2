// ============================================================================
// SERVICIO DE CANDIDATOS - Lógica de negocio para candidatos
// ============================================================================

import { Candidato } from '../../dominio/entidades/Candidato';
import { ICandidatoRepository } from '../../dominio/repositorios/ICandidatoRepository';
import mongoose from 'mongoose';

export class CandidatoService {
  constructor(private readonly candidatoRepository: ICandidatoRepository) {}

  async obtenerCandidato(id: string): Promise<Candidato | null> {
    return await this.candidatoRepository.obtenerPorId(id);
  }

  async buscarCandidatoPorDNI(dni: string): Promise<Candidato | null> {
    return await this.candidatoRepository.buscarPorDNI(dni);
  }

  async buscarCandidatoPorCorreo(correo: string): Promise<Candidato | null> {
    return await this.candidatoRepository.buscarPorCorreo(correo);
  }

  async crearCandidato(datos: Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'>, session?: mongoose.ClientSession): Promise<Candidato> {
    return await this.candidatoRepository.crear(datos, session);
  }

  async actualizarCandidato(id: string, datos: Partial<Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'>>, session?: mongoose.ClientSession): Promise<Candidato> {
    return await this.candidatoRepository.actualizar(id, datos, session);
  }

  async buscarCandidatos(filtros: {
    nombres?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    lugarResidencia?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ candidatos: Candidato[]; total: number }> {
    return await this.candidatoRepository.buscar(filtros);
  }

  async eliminarCandidato(id: string): Promise<void> {
    return await this.candidatoRepository.eliminar(id);
  }
}