// ============================================================================
// SERVICIO COMUNICACION ENTRADA - Lógica de negocio para comunicaciones de entrada
// ============================================================================

import {
  ComunicacionEntrada,
  CrearComunicacionEntradaInput,
  ActualizarComunicacionEntradaInput
} from '../../dominio/entidades/ComunicacionEntrada';
import { IComunicacionEntradaRepository } from '../../dominio/repositorios/IComunicacionEntradaRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';
import { ICandidatoRepository } from '../../dominio/repositorios/ICandidatoRepository';

export class ComunicacionEntradaService {
  constructor(
    private comunicacionRepository: IComunicacionEntradaRepository,
    private aplicacionRepository: IAplicacionCandidatoRepository,
    private candidatoRepository: ICandidatoRepository
  ) {}

  /**
   * Crear una nueva comunicación de entrada
   */
  async crear(input: CrearComunicacionEntradaInput): Promise<ComunicacionEntrada> {
    // Validar que la aplicación existe
    const aplicacion = await this.aplicacionRepository.obtenerPorId(input.aplicacionCandidatoId);
    if (!aplicacion) {
      throw new Error('Aplicación candidata no encontrada');
    }

    // Validar que el candidato existe
    const candidato = await this.candidatoRepository.obtenerPorId(input.candidatoId);
    if (!candidato) {
      throw new Error('Candidato no encontrado');
    }

    return this.comunicacionRepository.crear(input);
  }

  /**
   * Obtener comunicación por aplicación
   */
  async obtenerPorAplicacion(aplicacionCandidatoId: string): Promise<ComunicacionEntrada | null> {
    return this.comunicacionRepository.obtenerPorAplicacion(aplicacionCandidatoId);
  }

  /**
   * Actualizar comunicación existente
   */
  async actualizar(id: string, input: ActualizarComunicacionEntradaInput): Promise<ComunicacionEntrada | null> {
    const comunicacion = await this.comunicacionRepository.obtenerPorId(id);
    if (!comunicacion) {
      throw new Error('Comunicación de entrada no encontrada');
    }

    return this.comunicacionRepository.actualizar(id, input);
  }

  /**
   * Verificar si existe comunicación para aplicación
   */
  async existeParaAplicacion(aplicacionCandidatoId: string): Promise<boolean> {
    return this.comunicacionRepository.existeParaAplicacion(aplicacionCandidatoId);
  }
}
