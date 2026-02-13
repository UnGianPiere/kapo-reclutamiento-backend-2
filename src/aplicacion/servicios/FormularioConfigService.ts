// ============================================================================
// SERVICIO FORMULARIO CONFIG - Lógica de aplicación
// ============================================================================

import { IFormularioConfigRepository } from '../../dominio/repositorios/IFormularioConfigRepository';
import { FormularioConfig, CrearFormularioConfigInput, ActualizarFormularioConfigInput, CampoFormularioInput, CAMPOS_REQUERIDOS_BASE } from '../../dominio/entidades/FormularioConfig';
import { DomainException } from '../../dominio/exceptions/DomainException';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { addMonths } from 'date-fns';

export class FormularioConfigService {
  constructor(
    private readonly formularioConfigRepository: IFormularioConfigRepository
  ) {}

  /**
   * Crear configuración por defecto para una convocatoria
   */
  async crearConfiguracionPorDefecto(input: CrearFormularioConfigInput): Promise<FormularioConfig> {
    // Verificar que no exista configuración para esta convocatoria
    const existe = await this.formularioConfigRepository.existeParaConvocatoria(input.convocatoriaId);
    if (existe) {
      throw new DomainException('Ya existe una configuración de formulario para esta convocatoria', 'CONFLICT', 409);
    }

    // Usar campos por defecto si no se especifican
    const campos = input.campos || CAMPOS_REQUERIDOS_BASE;

    // Generar un ID único para el formulario
    const formularioId = uuidv4();

    // Generar token JWT usando el ID único del formulario
    const tokenJwt = this.generarTokenJwt(formularioId, input.convocatoriaId);
    const fechaExpiracion = input.fechaExpiracion || this.calcularFechaExpiracion();

    const configInput: CrearFormularioConfigInput = {
      ...input,
      campos,
      titulo: input.titulo || 'Formulario de Postulación',
      estado: input.estado || 'ACTIVO',
      urlPublico: formularioId, // Solo guardar el ID, no la URL completa
      tokenJwt,
      fechaExpiracion,
      creadoPor: input.creadoPor || 'system' // Siempre debe ser string
    };

    // Crear la configuración con el ID generado
    const configuracion = await this.formularioConfigRepository.crearConId(formularioId, configInput);

    // Validar la configuración creada
    await this.validarConfiguracion(configuracion.id);

    return configuracion;
  }

  /**
   * Obtener configuración de una convocatoria
   */
  async obtenerConfiguracionPorConvocatoria(convocatoriaId: string): Promise<FormularioConfig | null> {
    return await this.formularioConfigRepository.obtenerPorConvocatoriaId(convocatoriaId);
  }

  /**
   * Obtener configuración por ID del formulario
   */
  async obtenerConfiguracionPorId(formularioId: string): Promise<FormularioConfig | null> {
    return await this.formularioConfigRepository.obtenerPorFormularioId(formularioId);
  }

  /**
   * Actualizar configuración completa
   */
  async actualizarConfiguracion(id: string, input: ActualizarFormularioConfigInput): Promise<FormularioConfig> {
    // Validar cambios si se actualizan campos
    if (input.campos) {
      this.validarCampos(input.campos);
    }

    const configuracion = await this.formularioConfigRepository.actualizar(id, input);

    // Validar configuración actualizada
    await this.validarConfiguracion(id);

    return configuracion;
  }

  /**
   * Agregar campo personalizado
   */
  async agregarCampoPersonalizado(id: string, campo: CampoFormularioInput): Promise<FormularioConfig> {
    this.validarCampoIndividual(campo);

    // Verificar que no exista campo con mismo nombre
    const configuracion = await this.formularioConfigRepository.obtenerPorId(id);
    if (!configuracion) {
      throw new DomainException('Configuración no encontrada', 'NOT_FOUND', 404);
    }

    const nombreExistente = configuracion.campos.find(c => c.nombre === campo.nombre);
    if (nombreExistente) {
      throw new DomainException(`Ya existe un campo con el nombre "${campo.nombre}"`, 'VALIDATION_ERROR', 400);
    }

    return await this.formularioConfigRepository.agregarCampo(id, campo);
  }

  /**
   * Actualizar campo existente
   */
  async actualizarCampo(id: string, campoId: string, campo: Partial<CampoFormularioInput>): Promise<FormularioConfig> {
    if (campo.nombre) {
      // Verificar que no exista otro campo con el mismo nombre
      const configuracion = await this.formularioConfigRepository.obtenerPorId(id);
      if (!configuracion) {
        throw new DomainException('Configuración no encontrada', 'NOT_FOUND', 404);
      }

      const nombreExistente = configuracion.campos.find(c =>
        c.id !== campoId && c.nombre === campo.nombre
      );
      if (nombreExistente) {
        throw new DomainException(`Ya existe un campo con el nombre "${campo.nombre}"`, 'VALIDATION_ERROR', 400);
      }
    }

    if (Object.keys(campo).length > 0) {
      this.validarCampoIndividual(campo as CampoFormularioInput);
    }

    return await this.formularioConfigRepository.actualizarCampo(id, campoId, campo);
  }

  /**
   * Eliminar campo (solo campos personalizados, no los base)
   */
  async eliminarCampo(id: string, campoId: string): Promise<FormularioConfig> {
    const configuracion = await this.formularioConfigRepository.obtenerPorId(id);
    if (!configuracion) {
      throw new DomainException('Configuración no encontrada', 'NOT_FOUND', 404);
    }

    // Verificar que no sea un campo base requerido
    const campo = configuracion.campos.find(c => c.id === campoId);
    if (!campo) {
      throw new DomainException('Campo no encontrado', 'NOT_FOUND', 404);
    }

    const esCampoBase = CAMPOS_REQUERIDOS_BASE.some(c => c.nombre === campo.nombre);
    if (esCampoBase) {
      throw new DomainException('No se pueden eliminar campos base del formulario', 'VALIDATION_ERROR', 400);
    }

    return await this.formularioConfigRepository.eliminarCampo(id, campoId);
  }

  /**
   * Activar configuración (poner en producción)
   */
  async activarConfiguracion(id: string): Promise<FormularioConfig> {
    // Validar antes de activar
    await this.validarConfiguracion(id);

    return await this.formularioConfigRepository.cambiarEstado(id, 'ACTIVO');
  }

  /**
   * Desactivar configuración
   */
  async desactivarConfiguracion(id: string): Promise<FormularioConfig> {
    return await this.formularioConfigRepository.cambiarEstado(id, 'INACTIVO');
  }

  /**
   * Validar configuración completa
   */
  private async validarConfiguracion(id: string): Promise<void> {
    const configuracion = await this.formularioConfigRepository.obtenerPorId(id);
    if (!configuracion) {
      throw new DomainException('Configuración no encontrada', 'NOT_FOUND', 404);
    }

    // Validar campos base requeridos
    const camposRequeridos = ['correo', 'telefono', 'curriculum', 'terminos_aceptados'];
    for (const campoRequerido of camposRequeridos) {
      const campo = configuracion.campos.find(c => c.nombre === campoRequerido);
      if (!campo || !campo.habilitado) {
        throw new DomainException(`El campo "${campoRequerido}" debe estar habilitado`, 'VALIDATION_ERROR', 400);
      }
    }

    // Validar que no haya campos con nombres duplicados
    const nombres = configuracion.campos.map(c => c.nombre);
    const nombresUnicos = [...new Set(nombres)];
    if (nombres.length !== nombresUnicos.length) {
      throw new DomainException('Existen campos con nombres duplicados', 'VALIDATION_ERROR', 400);
    }

    // Validar orden único
    const ordenes = configuracion.campos.map(c => c.orden);
    const ordenesUnicos = [...new Set(ordenes)];
    if (ordenes.length !== ordenesUnicos.length) {
      throw new DomainException('Los números de orden deben ser únicos', 'VALIDATION_ERROR', 400);
    }

    // Validar todos los campos individualmente
    this.validarCampos(configuracion.campos);
  }

  /**
   * Validar array de campos
   */
  private validarCampos(campos: any[]): void {
    campos.forEach(campo => this.validarCampoIndividual(campo));
  }

  /**
   * Validar campo individual
   */
  private validarCampoIndividual(campo: CampoFormularioInput): void {
    if (!campo.nombre || campo.nombre.trim() === '') {
      throw new DomainException('El nombre del campo es obligatorio', 'VALIDATION_ERROR', 400);
    }

    if (!campo.etiqueta || campo.etiqueta.trim() === '') {
      throw new DomainException('La etiqueta del campo es obligatoria', 'VALIDATION_ERROR', 400);
    }

    if (!campo.tipo || !['text', 'email', 'tel', 'number', 'textarea', 'select', 'url', 'file', 'checkbox'].includes(campo.tipo)) {
      throw new DomainException('Tipo de campo inválido', 'VALIDATION_ERROR', 400);
    }

    // Validaciones específicas por tipo
    if (campo.tipo === 'select' && (!campo.opciones || campo.opciones.length === 0)) {
      throw new DomainException('Los campos de tipo "select" deben tener opciones', 'VALIDATION_ERROR', 400);
    }

    if (campo.tipo === 'url' && campo.validaciones?.patron) {
      // Validar que el patrón de URL sea válido
      try {
        new RegExp(campo.validaciones.patron);
      } catch {
        throw new DomainException('El patrón de validación para URL no es válido', 'VALIDATION_ERROR', 400);
      }
    }

    if (campo.tipo === 'file') {
      // Validar maxFiles si está definido
      if (campo.validaciones?.maxFiles !== undefined) {
        if (campo.validaciones.maxFiles <= 0 || campo.validaciones.maxFiles > 10) {
          throw new DomainException('El número máximo de archivos debe estar entre 1 y 10', 'VALIDATION_ERROR', 400);
        }
      }

      // Validar maxSize si está definido
      if (campo.validaciones?.maxSize !== undefined) {
        if (campo.validaciones.maxSize <= 0) {
          throw new DomainException('El tamaño máximo de archivo debe ser mayor a 0', 'VALIDATION_ERROR', 400);
        }
        if (campo.validaciones.maxSize > 104857600) { // 100MB en bytes
          throw new DomainException('El tamaño máximo de archivo no puede superar los 100MB', 'VALIDATION_ERROR', 400);
        }
      }

      // Validar allowedTypes si está definido
      if (campo.validaciones?.allowedTypes !== undefined && campo.validaciones.allowedTypes.length > 0) {
        // Validar que los tipos sean válidos
        const tiposValidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        const tiposInvalidos = campo.validaciones.allowedTypes.filter(tipo => !tiposValidos.includes(tipo));
        if (tiposInvalidos.length > 0) {
          throw new DomainException(`Tipos de archivo no válidos: ${tiposInvalidos.join(', ')}`, 'VALIDATION_ERROR', 400);
        }
      }
    }

    if (campo.validaciones?.min !== undefined && campo.validaciones?.max !== undefined && campo.validaciones.min > campo.validaciones.max) {
      throw new DomainException('El valor mínimo no puede ser mayor al máximo', 'VALIDATION_ERROR', 400);
    }
  }

  /**
   * Generar token JWT para autenticación del formulario
   */
  private generarTokenJwt(formularioId: string, convocatoriaId: string): string {
    const payload = {
      formularioId,
      convocatoriaId,
      type: 'formulario_config',
      iat: Math.floor(Date.now() / 1000)
    };

    const secret = process.env['JWT_SECRET'] || 'default-secret';
    return jwt.sign(payload, secret, { expiresIn: '1y' }); // Expira en 1 año por defecto
  }

  /**
   * Calcular fecha de expiración por defecto (6 meses)
   */
  private calcularFechaExpiracion(): Date {
    return addMonths(new Date(), 6);
  }
}