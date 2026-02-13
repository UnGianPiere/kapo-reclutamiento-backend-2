// ============================================================================
// REPOSITORIO FORMULARIO CONFIG - Contrato de dominio
// ============================================================================

import { FormularioConfig, CrearFormularioConfigInput, ActualizarFormularioConfigInput, CampoFormularioInput } from '../entidades/FormularioConfig';

export interface IFormularioConfigRepository {
  /**
   * Crear una nueva configuración de formulario
   */
  crear(input: CrearFormularioConfigInput): Promise<FormularioConfig>;

  /**
   * Crear una nueva configuración de formulario con ID específico
   */
  crearConId(id: string, input: CrearFormularioConfigInput): Promise<FormularioConfig>;

  /**
   * Obtener configuración por ID de convocatoria
   */
  obtenerPorConvocatoriaId(convocatoriaId: string): Promise<FormularioConfig | null>;

  /**
   * Obtener configuración por ID
   */
  obtenerPorId(id: string): Promise<FormularioConfig | null>;

  /**
   * Obtener configuración por ID del formulario (UUID)
   */
  obtenerPorFormularioId(formularioId: string): Promise<FormularioConfig | null>;

  /**
   * Actualizar configuración
   */
  actualizar(id: string, input: ActualizarFormularioConfigInput): Promise<FormularioConfig>;

  /**
   * Cambiar estado de la configuración
   */
  cambiarEstado(id: string, estado: 'BORRADOR' | 'ACTIVO' | 'INACTIVO'): Promise<FormularioConfig>;

  /**
   * Agregar campo personalizado
   */
  agregarCampo(id: string, campo: CampoFormularioInput): Promise<FormularioConfig>;

  /**
   * Actualizar campo existente
   */
  actualizarCampo(id: string, campoId: string, campo: Partial<CampoFormularioInput>): Promise<FormularioConfig>;

  /**
   * Eliminar campo
   */
  eliminarCampo(id: string, campoId: string): Promise<FormularioConfig>;

  /**
   * Reordenar campos
   */
  reordenarCampos(id: string, nuevosOrdenes: { campoId: string; orden: number }[]): Promise<FormularioConfig>;

  /**
   * Eliminar configuración
   */
  eliminar(id: string): Promise<void>;

  /**
   * Listar configuraciones con filtros
   */
  listar(filtros?: {
    estado?: string;
    creadoPor?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ configuraciones: FormularioConfig[]; total: number }>;

  /**
   * Verificar si existe configuración para una convocatoria
   */
  existeParaConvocatoria(convocatoriaId: string): Promise<boolean>;
}