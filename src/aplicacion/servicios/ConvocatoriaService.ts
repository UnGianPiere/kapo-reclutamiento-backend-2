// ============================================================================
// SERVICIO CONVOCATORIA - Recibir y consultar convocatorias desde MS PERSONAL
// ============================================================================

import { IConvocatoriaRepository } from '../../dominio/repositorios/IConvocatoriaRepository';
import { Convocatoria, RecibirConvocatoriaInput } from '../../dominio/entidades/Convocatoria';

export class ConvocatoriaService {
  constructor(private readonly convocatoriaRepository: IConvocatoriaRepository) {}

  async recibirConvocatoria(input: RecibirConvocatoriaInput): Promise<Convocatoria> {
    return this.convocatoriaRepository.crearOActualizarPorRequerimientoPersonalId(input);
  }

  async getByRequerimientoPersonalId(requerimientoPersonalId: string): Promise<Convocatoria | null> {
    return this.convocatoriaRepository.findByRequerimientoPersonalId(requerimientoPersonalId);
  }

  async getById(id: string): Promise<Convocatoria | null> {
    return this.convocatoriaRepository.findById(id);
  }

  async list(limit?: number, offset?: number): Promise<Convocatoria[]> {
    return this.convocatoriaRepository.list(limit ?? 50, offset ?? 0);
  }

  async obtenerConvocatoria(id: string): Promise<Convocatoria | null> {
    return this.getById(id);
  }
}
