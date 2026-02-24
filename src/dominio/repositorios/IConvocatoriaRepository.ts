// ============================================================================
// REPOSITORIO CONVOCATORIA - Crear/actualizar por requerimiento_personal_id
// ============================================================================

import { Convocatoria, RecibirConvocatoriaInput } from '../entidades/Convocatoria';

export interface IConvocatoriaRepository {
  crearOActualizarPorRequerimientoPersonalId(input: RecibirConvocatoriaInput): Promise<Convocatoria>;
  findByRequerimientoPersonalId(requerimientoPersonalId: string): Promise<Convocatoria | null>;
  findById(id: string): Promise<Convocatoria | null>;
  list(limit?: number, offset?: number): Promise<{ convocatorias: Convocatoria[]; totalCount: number }>;
}
