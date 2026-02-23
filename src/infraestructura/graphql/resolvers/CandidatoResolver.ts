// ============================================================================
// RESOLVER CANDIDATO - Queries y Mutations para candidatos
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { CandidatoService } from '../../../aplicacion/servicios/CandidatoService';
import { AplicacionService } from '../../../aplicacion/servicios/AplicacionService';
import { ErrorHandler } from './ErrorHandler';
import { CryptoUtil } from '../../config/crypto';

export class CandidatoResolver {
  constructor(
    private readonly candidatoService: CandidatoService,
    private readonly aplicacionService: AplicacionService
  ) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        // Queries normales (dashboard empresa)
        obtenerCandidato: async (_: unknown, args: { id: string }) => {
          const { id } = args;
          return await ErrorHandler.handleError(
            async () => await this.candidatoService.obtenerCandidato(id),
            'obtenerCandidato',
            { id }
          );
        },
        
        // Queries encriptadas (público)
        obtenerCandidatoEncriptado: async (_: unknown, args: { id: string }) => {
          const { id } = args;
          return await ErrorHandler.handleError(
            async () => {
              const candidato = await this.candidatoService.obtenerCandidato(id);
              
              if (!candidato) {
                return null;
              }
              
              // Encriptar todos los campos importantes
              return {
                id: CryptoUtil.encrypt(candidato.id),
                dni: CryptoUtil.encrypt(candidato.dni),
                nombres: CryptoUtil.encrypt(candidato.nombres),
                apellidoPaterno: CryptoUtil.encrypt(candidato.apellidoPaterno),
                apellidoMaterno: CryptoUtil.encrypt(candidato.apellidoMaterno),
                correo: CryptoUtil.encrypt(candidato.correo),
                telefono: CryptoUtil.encrypt(candidato.telefono),
                lugarResidencia: candidato.lugarResidencia ? CryptoUtil.encrypt(candidato.lugarResidencia) : candidato.lugarResidencia,
                curriculumUrl: candidato.curriculumUrl ? CryptoUtil.encrypt(candidato.curriculumUrl) : candidato.curriculumUrl,
                totalAplicaciones: candidato.totalAplicaciones,
                fechaRegistro: candidato.fechaRegistro,
                fechaActualizacion: candidato.fechaActualizacion,
                correosHistoricos: candidato.correosHistoricos?.map((email: string) => CryptoUtil.encrypt(email)) || [],
                telefonosHistoricos: candidato.telefonosHistoricos?.map((tel: string) => CryptoUtil.encrypt(tel)) || []
              };
            },
            'obtenerCandidatoEncriptado',
            { id }
          );
        },
        buscarCandidatoPorDNI: async (_: unknown, args: { dni: string }) => {
          const { dni } = args;
          return await ErrorHandler.handleError(
            async () => await this.candidatoService.buscarCandidatoPorDNI(dni),
            'buscarCandidatoPorDNI',
            { dni }
          );
        },
        buscarCandidatoPorCorreo: async (_: unknown, args: { correo: string }) => {
          const { correo } = args;
          return await ErrorHandler.handleError(
            async () => await this.candidatoService.buscarCandidatoPorCorreo(correo),
            'buscarCandidatoPorCorreo',
            { correo }
          );
        },
        // Query normal (dashboard empresa)
        listarCandidatos: async (_: unknown, args: {
          dni?: string;
          nombres?: string;
          correo?: string;
          telefono?: string;
          fechaRegistroDesde?: Date;
          fechaRegistroHasta?: Date;
          limit?: number;
          offset?: number;
        }) => {
          return await ErrorHandler.handleError(
            async () => {
              const filtros: {
                dni?: string;
                nombres?: string;
                apellidos?: string;
                correo?: string;
                telefono?: string;
                lugarResidencia?: string;
                limit?: number;
                offset?: number;
              } = {};

              // Mapear filtros del esquema al servicio
              if (args.dni !== undefined) filtros.dni = args.dni;
              if (args.nombres !== undefined) filtros.nombres = args.nombres;
              if (args.correo !== undefined) filtros.correo = args.correo;
              if (args.telefono !== undefined) filtros.telefono = args.telefono;

              filtros.limit = args.limit || 20;
              filtros.offset = args.offset || 0;

              const resultado = await this.candidatoService.buscarCandidatos(filtros);
              return {
                candidatos: resultado.candidatos,
                total: resultado.total
              };
            },
            'listarCandidatos',
            args
          );
        },
        
        // Query encriptada (público)
        listarCandidatosEncriptados: async (_: unknown, args: {
          dni?: string;
          nombres?: string;
          correo?: string;
          telefono?: string;
          fechaRegistroDesde?: Date;
          fechaRegistroHasta?: Date;
          limit?: number;
          offset?: number;
        }) => {
          return await ErrorHandler.handleError(
            async () => {
              const filtros: {
                dni?: string;
                nombres?: string;
                apellidos?: string;
                correo?: string;
                telefono?: string;
                lugarResidencia?: string;
                limit?: number;
                offset?: number;
              } = {};

              // Mapear filtros del esquema al servicio
              if (args.dni !== undefined) filtros.dni = args.dni;
              if (args.nombres !== undefined) filtros.nombres = args.nombres;
              if (args.correo !== undefined) filtros.correo = args.correo;
              if (args.telefono !== undefined) filtros.telefono = args.telefono;

              filtros.limit = args.limit || 20;
              filtros.offset = args.offset || 0;

              const resultado = await this.candidatoService.buscarCandidatos(filtros);
              const encryptedCandidatos = resultado.candidatos.map(candidato => ({
                id: CryptoUtil.encrypt(candidato.id),
                dni: CryptoUtil.encrypt(candidato.dni),
                nombres: CryptoUtil.encrypt(candidato.nombres),
                apellidoPaterno: CryptoUtil.encrypt(candidato.apellidoPaterno),
                apellidoMaterno: CryptoUtil.encrypt(candidato.apellidoMaterno),
                correo: CryptoUtil.encrypt(candidato.correo),
                telefono: CryptoUtil.encrypt(candidato.telefono),
                lugarResidencia: candidato.lugarResidencia ? CryptoUtil.encrypt(candidato.lugarResidencia) : candidato.lugarResidencia,
                curriculumUrl: candidato.curriculumUrl ? CryptoUtil.encrypt(candidato.curriculumUrl) : candidato.curriculumUrl,
                totalAplicaciones: candidato.totalAplicaciones,
                fechaRegistro: candidato.fechaRegistro,
                fechaActualizacion: candidato.fechaActualizacion,
                correosHistoricos: candidato.correosHistoricos?.map((email: string) => CryptoUtil.encrypt(email)) || [],
                telefonosHistoricos: candidato.telefonosHistoricos?.map((tel: string) => CryptoUtil.encrypt(tel)) || []
              }));
              return {
                candidatos: encryptedCandidatos,
                total: resultado.total
              };
            },
            'listarCandidatosEncriptados',
            args
          );
        },
        obtenerCandidatosDuplicados: async () => {
          return await ErrorHandler.handleError(
            async () => {
              // TODO: Implement logic for obtenerCandidatosDuplicados
              return [];
            },
            'obtenerCandidatosDuplicados'
          );
        }
      },
      Mutation: {
        crearCandidato: async (_: unknown, args: { input: any }) => {
          const { input } = args;
          return await ErrorHandler.handleError(
            async () => await this.candidatoService.crearCandidato(input),
            'crearCandidato',
            input
          );
        },
        actualizarCandidato: async (_: unknown, args: { id: string; input: any }) => {
          const { id, input } = args;
          return await ErrorHandler.handleError(
            async () => await this.candidatoService.actualizarCandidato(id, input),
            'actualizarCandidato',
            { id }
          );
        },
        eliminarCandidato: async (_: unknown, args: { id: string }) => {
          const { id } = args;
          return await ErrorHandler.handleError(
            async () => {
              await this.candidatoService.eliminarCandidato(id);
              return true;
            },
            'eliminarCandidato',
            { id }
          );
        },
        fusionarCandidatos: async (_: unknown, args: { candidatoPrincipalId: string; candidatoDuplicadoId: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              // TODO: Implement logic for fusionarCandidatos
              throw new Error('Not implemented');
            },
            'fusionarCandidatos',
            args
          );
        }
      },

      Candidato: {
        fechaRegistro: (parent: any) => parent.fechaRegistro || parent.fechaCreacion,
        totalAplicaciones: async (parent: any) => {
          // Si ya tenemos el valor almacenado, úsalo (evita consultas con IDs encriptados)
          if (parent.totalAplicaciones !== undefined) {
            return parent.totalAplicaciones;
          }
          
          try {
            const aplicaciones = await this.aplicacionService.obtenerAplicacionesPorCandidato(parent.id);
            return aplicaciones.length;
          } catch (error) {
            console.error('Error calculando totalAplicaciones:', error);
            return 0;
          }
        },
        correosHistoricos: (parent: any) => parent.correosHistoricos || [],
        telefonosHistoricos: (parent: any) => parent.telefonosHistoricos || []
      }
    };
  }
}
