// ============================================================================
// INTERFAZ DEL REPOSITORIO - PERSONAL (PUERTO DE SALIDA)
// ============================================================================

import { IBaseRepository } from './IBaseRepository';
import { Personal, PersonalFilterInput, PersonalReferenciasInput, PersonalPaginadoResult } from '../entidades/Personal';

export interface IPersonalRepository extends IBaseRepository<Personal> {
  /**
   * Obtener empleados paginados desde el sistema PERSONAL
   */
  empleadosPaginados(
    page?: number,
    limit?: number,
    filter?: PersonalFilterInput,
    referencias?: PersonalReferenciasInput
  ): Promise<PersonalPaginadoResult>;

  /**
   * Obtener empleado por ID desde el sistema PERSONAL
   */
  obtenerEmpleadoPorId(id: string): Promise<Personal | null>;

  /**
   * Buscar empleados por texto desde el sistema PERSONAL
   */
  buscarEmpleados(search?: string, page?: number, limit?: number): Promise<PersonalPaginadoResult>;

  /**
   * Obtener empleados disponibles desde el sistema PERSONAL
   */
  obtenerEmpleadosDisponibles(page?: number, limit?: number): Promise<PersonalPaginadoResult>;
}