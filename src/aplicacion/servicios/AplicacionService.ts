// ============================================================================
// SERVICIO DE APLICACIONES - Lógica de negocio para postulaciones
// ============================================================================
import { AplicacionCandidato, CrearAplicacionInput, ActualizarAplicacionInput } from '../../dominio/entidades/AplicacionCandidato';
import { Candidato } from '../../dominio/entidades/Candidato';
import { EstadoKanban } from '../../dominio/entidades/EstadoKanban';
import { ICandidatoRepository } from '../../dominio/repositorios/ICandidatoRepository';
import { IAplicacionCandidatoRepository } from '../../dominio/repositorios/IAplicacionCandidatoRepository';
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
    pretensionEconomica: number;
    curriculumUrl: string;
  };
  aplicadoPor: 'CANDIDATO' | 'RECLUTADOR';
}

export class AplicacionService {
  constructor(
    private readonly candidatoRepository: ICandidatoRepository,
    private readonly aplicacionRepository: IAplicacionCandidatoRepository
  ) {}

  async crearAplicacionCompleta(input: CrearAplicacionCompletaInput): Promise<AplicacionCandidato> {
    // Usar transacción para asegurar atomicidad
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        console.log('AplicacionService.crearAplicacionCompleta - Starting transaction');

        // 1. Buscar o crear candidato
        let candidato = await this.buscarCandidatoPorDNI(input.candidatoData.dni);

        if (!candidato) {
          console.log('AplicacionService.crearAplicacionCompleta - Creating new candidate');
          candidato = await this.crearCandidato(input.candidatoData, session);
          console.log('AplicacionService.crearAplicacionCompleta - Candidate created:', candidato.id);
        } else {
          console.log('AplicacionService.crearAplicacionCompleta - Candidate exists:', candidato.id);
          // Actualizar datos si han cambiado
          candidato = await this.actualizarCandidatoSiNecesario(candidato, input.candidatoData, session);
        }

        // 2. Crear aplicación con datos completos
        const aplicacion: AplicacionCandidato = {
          id: '', // Se asignará en persistencia
          candidatoId: candidato.id,
          convocatoriaId: input.convocatoriaId,

          // ✅ Respuestas del formulario (CAMPOS DINÁMICOS)
          respuestasFormulario: input.respuestasFormulario,

          // ✅ Estado inicial del kanban
          estadoKanban: EstadoKanban.CVS_RECIBIDOS,

          // ✅ CAMPOS ESPECÍFICOS (directos en AplicacionCandidato)
          aniosExperienciaPuesto: input.camposEspecificos.aniosExperienciaPuesto,
          pretensionEconomica: input.camposEspecificos.pretensionEconomica,
          curriculumUrl: input.camposEspecificos.curriculumUrl,

          // Metadata
          fechaAplicacion: new Date(),
          aplicadoPor: input.aplicadoPor,

          // Valores por defecto para campos opcionales
          posibleDuplicado: false,
          duplicadoRevisado: false,
          esRepostulacion: false,
          esPosibleCandidatoActivado: false
        };

        // 3. Persistir aplicación
        const aplicacionGuardada = await this.guardarAplicacion(aplicacion, session);
        console.log('AplicacionService.crearAplicacionCompleta - Application created:', aplicacionGuardada.id);

        return aplicacionGuardada;
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
    const candidatoData: Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
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
      const updateData: Partial<Omit<Candidato, 'id' | 'fechaCreacion' | 'fechaActualizacion'>> = {
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

  private async guardarAplicacion(aplicacion: AplicacionCandidato, session?: mongoose.ClientSession): Promise<AplicacionCandidato> {
    // Convertir convocatoriaId a ObjectId válido
    let convocatoriaObjectId: string;
    try {
      // Intentar convertir el ID recibido
      new mongoose.Types.ObjectId(aplicacion.convocatoriaId);
      convocatoriaObjectId = aplicacion.convocatoriaId;
    } catch (error) {
      // Si no es válido, usar un ObjectId de prueba (esto es temporal para desarrollo)
      console.warn('convocatoriaId no válido, usando ObjectId de prueba:', aplicacion.convocatoriaId);
      convocatoriaObjectId = new mongoose.Types.ObjectId().toString();
    }

    // Crear la aplicación usando el repositorio con todos los campos requeridos
    const aplicacionInput: CrearAplicacionInput = {
      candidatoId: aplicacion.candidatoId,
      convocatoriaId: convocatoriaObjectId,
      respuestasFormulario: aplicacion.respuestasFormulario || {},
      aplicadoPor: aplicacion.aplicadoPor,
      aniosExperienciaPuesto: aplicacion.aniosExperienciaPuesto,
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
    return await this.aplicacionRepository.cambiarEstadoKanban(id, estadoKanban);
  }

  async eliminarAplicacion(id: string): Promise<void> {
    return await this.aplicacionRepository.eliminar(id);
  }
}