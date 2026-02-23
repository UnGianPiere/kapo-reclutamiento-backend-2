// ============================================================================
// SERVICIO DE APLICACIONES - Lógica de negocio para postulaciones
// ============================================================================
import { AplicacionCandidato, CrearAplicacionInput, ActualizarAplicacionInput } from '../../dominio/entidades/AplicacionCandidato';
import { Candidato } from '../../dominio/entidades/Candidato';
import { EstadoKanban } from '../../dominio/entidades/EstadoKanban';
import { ICandidatoRepository } from '../../dominio/repositorios/ICandidatoRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';
import { HistorialCandidatoService } from './HistorialCandidatoService';
import mongoose from 'mongoose';

export interface CrearAplicacionCompletaInput {
  convocatoriaId: string;
  candidatoData: {
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    telefono: string;
    lugarResidencia?: string;
    curriculumUrl: string;
  };
  respuestasFormulario: Record<string, unknown>; // Campos dinámicos en JSON
  camposEspecificos: { // Campos directos en AplicacionCandidato
    aniosExperienciaPuesto: number;
    aniosExperienciaGeneral: number;  // ← AGREGAR ESTE
    medioConvocatoria: string;       // ← AGREGAR ESTE
    pretensionEconomica: number;
    curriculumUrl: string;
  };
  aplicadoPor: 'CANDIDATO' | 'RECLUTADOR';
}

export class AplicacionService {
  constructor(
    private readonly candidatoRepository: ICandidatoRepository,
    private readonly aplicacionRepository: IAplicacionCandidatoRepository,
    private readonly historialService: HistorialCandidatoService
  ) {}

  async crearAplicacionCompleta(input: CrearAplicacionCompletaInput): Promise<AplicacionCandidato> {
    // Usar transacción para asegurar atomicidad
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        console.log('AplicacionService.crearAplicacionCompleta - Starting transaction');

        // 1. Buscar candidato
        let candidato = await this.buscarCandidatoPorDNI(input.candidatoData.dni);

        // 2. Buscar aplicación existente del mismo candidato a la misma convocatoria
        let aplicacionExistente: AplicacionCandidato | null = null;
        if (candidato) {
          aplicacionExistente = await this.aplicacionRepository.obtenerPorCandidatoYConvocatoria(candidato.id, input.convocatoriaId);
        }

        // 3. Manejar los tres casos
        if (aplicacionExistente && candidato) {
          // CASO 1: Mismo candidato, misma convocatoria (ACTUALIZACIÓN)
          console.log('Caso 1: Actualizando aplicación existente para candidato:', candidato.id, 'en convocatoria:', input.convocatoriaId);
          
          // Actualizar datos del candidato si es necesario
          candidato = await this.actualizarCandidatoSiNecesario(candidato, input.candidatoData, session);
          
          // Actualizar aplicación existente
          const aplicacionActualizada = await this.actualizarAplicacion(aplicacionExistente.id, {
            aniosExperienciaPuesto: input.camposEspecificos.aniosExperienciaPuesto,
            aniosExperienciaGeneral: input.camposEspecificos.aniosExperienciaGeneral,
            medioConvocatoria: input.camposEspecificos.medioConvocatoria,
            pretensionEconomica: input.camposEspecificos.pretensionEconomica,
            curriculumUrl: input.camposEspecificos.curriculumUrl,
            respuestasFormulario: input.respuestasFormulario
          });
          
          return aplicacionActualizada;
          
        } else if (candidato) {
          // CASO 2: Mismo candidato, diferente convocatoria (NUEVA APLICACIÓN)
          console.log('Caso 2: Creando nueva aplicación para candidato existente:', candidato.id, 'en convocatoria:', input.convocatoriaId);
          
          // Actualizar candidato con datos más recientes e incrementar totalAplicaciones
          candidato = await this.actualizarCandidatoSiNecesario(candidato, input.candidatoData, session);
          await this.incrementarTotalAplicaciones(candidato.id, session);
          
          // Crear nueva aplicación
          const aplicacion = await this.guardarAplicacion({
            id: '',
            candidatoId: candidato.id,
            convocatoriaId: input.convocatoriaId,
            respuestasFormulario: input.respuestasFormulario,
            estadoKanban: EstadoKanban.CVS_RECIBIDOS,
            aniosExperienciaPuesto: input.camposEspecificos.aniosExperienciaPuesto,
            aniosExperienciaGeneral: input.camposEspecificos.aniosExperienciaGeneral,
            medioConvocatoria: input.camposEspecificos.medioConvocatoria,
            pretensionEconomica: input.camposEspecificos.pretensionEconomica,
            curriculumUrl: input.camposEspecificos.curriculumUrl,
            fechaAplicacion: new Date(),
            aplicadoPor: input.aplicadoPor,
            posibleDuplicado: false,
            duplicadoRevisado: false,
            esRepostulacion: false,
            esPosibleCandidatoActivado: false
          }, session);
          return aplicacion;
          
        } else {
          // CASO 3: Candidato completamente nuevo (CREAR TODO)
          console.log('Caso 3: Creando nuevo candidato y aplicación');
          
          // Crear nuevo candidato con totalAplicaciones = 1
          candidato = await this.crearCandidato(input.candidatoData, session);
          console.log('AplicacionService.crearAplicacionCompleta - Candidate created:', candidato.id);
          
          // Inicializar estadísticas del candidato
          await this.inicializarEstadisticasCandidato(candidato.id, session);
          
          // Crear nueva aplicación
          const aplicacion = await this.guardarAplicacion({
            id: '',
            candidatoId: candidato.id,
            convocatoriaId: input.convocatoriaId,
            respuestasFormulario: input.respuestasFormulario,
            estadoKanban: EstadoKanban.CVS_RECIBIDOS,
            aniosExperienciaPuesto: input.camposEspecificos.aniosExperienciaPuesto,
            aniosExperienciaGeneral: input.camposEspecificos.aniosExperienciaGeneral,
            medioConvocatoria: input.camposEspecificos.medioConvocatoria,
            pretensionEconomica: input.camposEspecificos.pretensionEconomica,
            curriculumUrl: input.camposEspecificos.curriculumUrl,
            fechaAplicacion: new Date(),
            aplicadoPor: input.aplicadoPor,
            posibleDuplicado: false,
            duplicadoRevisado: false,
            esRepostulacion: false,
            esPosibleCandidatoActivado: false
          }, session);
          return aplicacion;
        }
      });
    } catch (error) {
      console.error('AplicacionService.crearAplicacionCompleta - Transaction failed:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Métodos auxiliares usando repositorios reales
  private async buscarCandidatoPorDNI(dni: string): Promise<Candidato | null> {
    return await this.candidatoRepository.buscarPorDNI(dni);
  }

  private async crearCandidato(data: CrearAplicacionCompletaInput['candidatoData'], session?: mongoose.ClientSession): Promise<Candidato> {
    const candidatoData: any = {
      dni: data.dni,
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      correo: data.correo,
      telefono: data.telefono,
      curriculumUrl: data.curriculumUrl
    };

    if (data.lugarResidencia !== undefined) {
      candidatoData.lugarResidencia = data.lugarResidencia;
    }

    return await this.candidatoRepository.crear(candidatoData, session);
  }

  private async actualizarCandidatoSiNecesario(candidato: Candidato, nuevosDatos: CrearAplicacionCompletaInput['candidatoData'], session?: mongoose.ClientSession): Promise<Candidato> {
    // Verificar si hay cambios
    const hayCambios = (
      candidato.nombres !== nuevosDatos.nombres ||
      candidato.apellidoPaterno !== nuevosDatos.apellidoPaterno ||
      candidato.apellidoMaterno !== nuevosDatos.apellidoMaterno ||
      candidato.correo !== nuevosDatos.correo ||
      candidato.telefono !== nuevosDatos.telefono ||
      candidato.lugarResidencia !== nuevosDatos.lugarResidencia ||
      candidato.curriculumUrl !== nuevosDatos.curriculumUrl
    );

    if (hayCambios) {
      const updateData: Partial<Candidato> = {
        nombres: nuevosDatos.nombres,
        apellidoPaterno: nuevosDatos.apellidoPaterno,
        apellidoMaterno: nuevosDatos.apellidoMaterno,
        correo: nuevosDatos.correo,
        telefono: nuevosDatos.telefono,
        curriculumUrl: nuevosDatos.curriculumUrl
      };

      if (nuevosDatos.lugarResidencia !== undefined) {
        updateData.lugarResidencia = nuevosDatos.lugarResidencia;
      }

      return await this.candidatoRepository.actualizar(candidato.id, updateData, session);
    }

    return candidato;
  }

  private async incrementarTotalAplicaciones(candidatoId: string, session?: mongoose.ClientSession): Promise<void> {
    await this.candidatoRepository.incrementarTotalAplicaciones(candidatoId, session);
  }

  private async incrementarAplicacionesGanadas(candidatoId: string): Promise<void> {
    await this.candidatoRepository.incrementarAplicacionesGanadas(candidatoId);
  }

  private async inicializarEstadisticasCandidato(candidatoId: string, session?: mongoose.ClientSession): Promise<void> {
    await this.candidatoRepository.inicializarEstadisticas(candidatoId, session);
  }

  private async guardarAplicacion(aplicacion: AplicacionCandidato, session?: mongoose.ClientSession): Promise<AplicacionCandidato> {
    let convocatoriaObjectId: string;
    try {
      // Intentar convertir el ID recibido
      new mongoose.Types.ObjectId(aplicacion.convocatoriaId);
      convocatoriaObjectId = aplicacion.convocatoriaId;
    } catch (error) {
      // Si no es válido, usar un ObjectId de prueba (esto es temporal para desarrollo)
      convocatoriaObjectId = new mongoose.Types.ObjectId().toString();
    }

    // Crear la aplicación usando el repositorio con todos los campos requeridos
    const aplicacionInput: CrearAplicacionInput = {
      candidatoId: aplicacion.candidatoId,
      convocatoriaId: convocatoriaObjectId,
      respuestasFormulario: aplicacion.respuestasFormulario || {},
      aplicadoPor: aplicacion.aplicadoPor,
      aniosExperienciaPuesto: aplicacion.aniosExperienciaPuesto,
      aniosExperienciaGeneral: aplicacion.aniosExperienciaGeneral !== undefined ? aplicacion.aniosExperienciaGeneral : 0,
      medioConvocatoria: aplicacion.medioConvocatoria !== undefined ? aplicacion.medioConvocatoria : 'Otro',
      pretensionEconomica: aplicacion.pretensionEconomica,
      curriculumUrl: aplicacion.curriculumUrl
    };

    const nuevaAplicacion = await this.aplicacionRepository.crear(aplicacionInput, session);
    return nuevaAplicacion;
  }

  async obtenerAplicacion(id: string): Promise<AplicacionCandidato | null> {
    return await this.aplicacionRepository.obtenerPorId(id);
  }

  async listarAplicaciones(filtros?: Parameters<IAplicacionCandidatoRepository['listar']>[0]): Promise<{ aplicaciones: AplicacionCandidato[]; total: number }> {
    return await this.aplicacionRepository.listar(filtros);
  }

  async obtenerAplicacionesPorCandidato(candidatoId: string): Promise<AplicacionCandidato[]> {
    return await this.aplicacionRepository.obtenerPorCandidato(candidatoId);
  }

  async obtenerAplicacionesPorConvocatoria(convocatoriaId: string): Promise<AplicacionCandidato[]> {
    return await this.aplicacionRepository.obtenerPorConvocatoria(convocatoriaId);
  }

  async obtenerEstadisticasConvocatoria(convocatoriaId: string): Promise<{
    total: number;
    porEstadoKanban: Record<EstadoKanban, number>;
    porPosiblesCandidatos: number;
    duplicadosPendientes: number;
  }> {
    return await this.aplicacionRepository.obtenerEstadisticasPorConvocatoria(convocatoriaId);
  }

  async getKanbanData(convocatoriaId?: string, filtros?: any): Promise<any> {
    // Usar constantes de estado kanban importadas estáticamente
    const { ESTADOS_KANBAN_VALIDOS } = await import('../../dominio/entidades/EstadoKanban');

    // Crear queries paralelas para cada estado (limitado a 20 por estado para carga inicial)
    const queries = ESTADOS_KANBAN_VALIDOS.map((estado: EstadoKanban) =>
      this.aplicacionRepository.listar({
        estadoKanban: estado,
        convocatoriaId,
        limit: 20, // Limit inicial para kanban
        offset: 0,
        ...filtros
      })
    );

    // Ejecutar todas las queries en paralelo para mejor rendimiento
    const resultados = await Promise.all(queries);

    // Organizar resultados por estado kanban
    const kanbanData: any = {};
    ESTADOS_KANBAN_VALIDOS.forEach((estado: EstadoKanban, index: number) => {
      const resultado = resultados[index];
      if (!resultado) {
        // Fallback si no hay resultado para este estado
        kanbanData[estado] = {
          aplicaciones: [],
          total: 0,
          hasNextPage: false
        };
      } else {
        kanbanData[estado] = {
          aplicaciones: resultado.aplicaciones,
          total: resultado.total,
          hasNextPage: resultado.total > 20 // Si hay más de 20, hay siguiente página
        };
      }
    });

    return kanbanData;
  }

  async actualizarAplicacion(id: string, input: ActualizarAplicacionInput): Promise<AplicacionCandidato> {
    return await this.aplicacionRepository.actualizar(id, input);
  }

  async cambiarEstadoKanban(id: string, estadoKanban: EstadoKanban): Promise<AplicacionCandidato> {
    // Obtener la aplicación antes del cambio
    const aplicacionActual = await this.aplicacionRepository.obtenerPorId(id);
    if (!aplicacionActual) {
      throw new Error(`Aplicación con ID ${id} no encontrada`);
    }

    // Cambiar el estado
    const aplicacionActualizada = await this.aplicacionRepository.cambiarEstadoKanban(id, estadoKanban);

    // Si el nuevo estado es FINALIZADA, incrementar aplicacionesGanadas del candidato
    if (estadoKanban === EstadoKanban.FINALIZADA) {
      await this.incrementarAplicacionesGanadas(aplicacionActual.candidatoId);
    }

    return aplicacionActualizada;
  }

  async reactivarAplicacion(id: string, realizadoPor: string, realizadoPorNombre: string, motivo?: string, comentarios?: string): Promise<AplicacionCandidato> {
    // Obtener la aplicación actual
    const aplicacion = await this.aplicacionRepository.obtenerPorId(id);
    if (!aplicacion) {
      throw new Error(`Aplicación con ID ${id} no encontrada`);
    }

    // Verificar que esté en un estado archivado
    if (aplicacion.estadoKanban !== EstadoKanban.RECHAZADO_POR_CANDIDATO && 
        aplicacion.estadoKanban !== EstadoKanban.DESCARTADO && 
        aplicacion.estadoKanban !== EstadoKanban.POSIBLES_CANDIDATOS) {
      throw new Error(`Solo se pueden reactivar aplicaciones en estado RECHAZADO_POR_CANDIDATO, DESCARTADO o POSIBLES_CANDIDATOS`);
    }

    // Obtener el último cambio de estado
    const ultimoCambio = await this.historialService.obtenerUltimoCambioEstado(id);
    if (!ultimoCambio) {
      throw new Error(`No se encontró historial para la aplicación ${id}`);
    }

    // El estado anterior del último cambio es donde debemos reactivar
    const nuevoEstado = ultimoCambio.estadoAnterior;

    // Cambiar el estado de la aplicación
    const aplicacionActualizada = await this.aplicacionRepository.cambiarEstadoKanban(id, nuevoEstado);

    // Registrar el cambio en el historial como REACTIVACION
    await this.historialService.registrarCambio({
      candidatoId: aplicacion.candidatoId,
      aplicacionId: id,
      estadoAnterior: aplicacion.estadoKanban, // Estado archivado actual
      estadoNuevo: nuevoEstado, // Estado anterior al que se reactiva
      tipoCambio: 'REACTIVACION',
      realizadoPor,
      realizadoPorNombre,
      motivo: motivo || 'Reactivación desde estado archivado',
      comentarios: comentarios || `Reactivado desde ${aplicacion.estadoKanban} a ${nuevoEstado}`,
      tiempoEnEstadoAnterior: ultimoCambio.tiempoEnEstadoAnterior || 0
    });

    return aplicacionActualizada;
  }

  async eliminarAplicacion(id: string): Promise<void> {
    return await this.aplicacionRepository.eliminar(id);
  }
}