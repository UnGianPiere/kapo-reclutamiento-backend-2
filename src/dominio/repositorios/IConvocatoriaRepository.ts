// ============================================================================
// REPOSITORIO CONVOCATORIA - Crear/actualizar por requerimiento_personal_id
// ============================================================================

import { Convocatoria, RecibirConvocatoriaInput } from '../entidades/Convocatoria';
import mongoose from 'mongoose';

export interface IConvocatoriaRepository {
  crearOActualizarPorRequerimientoPersonalId(input: RecibirConvocatoriaInput): Promise<Convocatoria>;
  findByRequerimientoPersonalId(requerimientoPersonalId: string): Promise<Convocatoria | null>;
  findById(id: string): Promise<Convocatoria | null>;
  actualizar(id: string, datos: Partial<Convocatoria>, session?: mongoose.ClientSession): Promise<Convocatoria>;
  list(limit?: number, offset?: number): Promise<{ convocatorias: Convocatoria[]; totalCount: number }>;
}
