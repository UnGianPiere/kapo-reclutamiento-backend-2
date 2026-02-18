// ============================================================================
// RESOLVER APLICACION CANDIDATO - Queries y Mutations para aplicaciones
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { AplicacionService } from '../../../aplicacion/servicios/AplicacionService';
import { EstadoKanban } from '../../../dominio/entidades/EstadoKanban';
import { ErrorHandler } from './ErrorHandler';
import { CandidatoService } from '../../../aplicacion/servicios/CandidatoService';
import { ConvocatoriaService } from '../../../aplicacion/servicios/ConvocatoriaService';

export class AplicacionCandidatoResolver {
  constructor(
    private readonly aplicacionService: AplicacionService,
    private readonly candidatoService: CandidatoService,
    private readonly convocatoriaService: ConvocatoriaService
  ) {}

  getResolvers(): IResolvers {
    return {
      // Resolvers para campos relacionados
      AplicacionCandidato: {
        candidato: async (parent: { candidatoId: string }) => {
          try {
            return await this.candidatoService.obtenerCandidato(parent.candidatoId);
          } catch (error) {
            console.error('Error resolviendo candidato:', error);
            return null;
          }
        },
        convocatoria: async (parent: { convocatoriaId: string }) => {
          try {
            return await this.convocatoriaService.obtenerConvocatoria(parent.convocatoriaId);
          } catch (error) {
            console.error('Error resolviendo convocatoria:', error);
            return null;
          }
        },
        // Resolver para timestamp de actualización
        updatedAt: (parent: any) => parent.updatedAt?.toISOString() || null
      },

      // Resolvers para campos de Candidato (mapeo snake_case -> camelCase)
      Candidato: {
        fechaRegistro: (parent: any) => parent.fechaCreacion,
      },

      // Resolvers para campos de Convocatoria (mapeo snake_case -> camelCase)
      Convocatoria: {
        codigoConvocatoria: (parent: any) => parent.codigo_convocatoria,
        cargoNombre: (parent: any) => parent.cargo_nombre,
        obraNombre: (parent: any) => parent.obra_nombre,
        empresaNombre: (parent: any) => parent.empresa_nombre,
        estadoConvocatoria: (parent: any) => parent.estado_convocatoria,
        fechaInicio: (parent: any) => parent.fecha_creacion,
      },

      Query: {
        obtenerAplicacion: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.obtenerAplicacion(args.id),
            'obtenerAplicacion',
            args
          );
        },
        listarAplicaciones: async (_: unknown, args: {
          estadoKanban?: EstadoKanban;
          candidatoId?: string;
          convocatoriaId?: string;
          ordenPrioridad?: number;
          aplicadoPor?: string;
          fechaDesde?: Date;
          fechaHasta?: Date;
          posibleDuplicado?: boolean;
          duplicadoRevisado?: boolean;
          limit?: number;
          offset?: number;
        }) => {
          return await ErrorHandler.handleError(
            async () => {
              const filtros: {
                estadoKanban?: EstadoKanban;
                candidatoId?: string;
                convocatoriaId?: string;
                ordenPrioridad?: number;
                aplicadoPor?: string;
                fechaDesde?: Date;
                fechaHasta?: Date;
                posibleDuplicado?: boolean;
                duplicadoRevisado?: boolean;
                limit?: number;
                offset?: number;
              } = {};

              // Asignar solo propiedades definidas para evitar undefined
              if (args.estadoKanban !== undefined) filtros.estadoKanban = args.estadoKanban;
              if (args.candidatoId !== undefined) filtros.candidatoId = args.candidatoId;
              if (args.convocatoriaId !== undefined) filtros.convocatoriaId = args.convocatoriaId;
              if (args.ordenPrioridad !== undefined) filtros.ordenPrioridad = args.ordenPrioridad;
              if (args.aplicadoPor !== undefined) filtros.aplicadoPor = args.aplicadoPor;
              if (args.fechaDesde !== undefined) filtros.fechaDesde = args.fechaDesde;
              if (args.fechaHasta !== undefined) filtros.fechaHasta = args.fechaHasta;
              if (args.posibleDuplicado !== undefined) filtros.posibleDuplicado = args.posibleDuplicado;
              if (args.duplicadoRevisado !== undefined) filtros.duplicadoRevisado = args.duplicadoRevisado;

              filtros.limit = args.limit || 20;
              filtros.offset = args.offset || 0;

              const resultado = await this.aplicacionService.listarAplicaciones(filtros);
              return {
                aplicaciones: resultado.aplicaciones,
                total: resultado.total
              };
            },
            'listarAplicaciones',
            args
          );
        },
        obtenerAplicacionesPorCandidato: async (_: unknown, args: { candidatoId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.obtenerAplicacionesPorCandidato(args.candidatoId),
            'obtenerAplicacionesPorCandidato',
            args
          );
        },
        obtenerAplicacionesPorConvocatoria: async (_: unknown, args: { convocatoriaId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.obtenerAplicacionesPorConvocatoria(args.convocatoriaId),
            'obtenerAplicacionesPorConvocatoria',
            args
          );
        },
        obtenerEstadisticasConvocatoria: async (_: unknown, args: { convocatoriaId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.obtenerEstadisticasConvocatoria(args.convocatoriaId),
            'obtenerEstadisticasConvocatoria',
            args
          );
        },
        getKanbanData: async (_: unknown, args: { convocatoriaId?: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.getKanbanData(args.convocatoriaId),
            'getKanbanData',
            args
          );
        }
      },
      Mutation: {
        crearAplicacion: async (_: unknown, args: { input: any }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.crearAplicacionCompleta(args.input),
            'crearAplicacion',
            args.input
          );
        },
        actualizarAplicacion: async (_: unknown, args: { id: string; input: any }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.actualizarAplicacion(args.id, args.input),
            'actualizarAplicacion',
            { id: args.id }
          );
        },
        cambiarEstadoKanban: async (_: unknown, args: { id: string; estadoKanban: EstadoKanban }) => {
          return await ErrorHandler.handleError(
            async () => await this.aplicacionService.cambiarEstadoKanban(args.id, args.estadoKanban),
            'cambiarEstadoKanban',
            args
          );
        },
        eliminarAplicacion: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              await this.aplicacionService.eliminarAplicacion(args.id);
              return true;
            },
            'eliminarAplicacion',
            args
          );
        }
      }
    };
  }
}