// ============================================================================
// RESOLVER HISTORIAL CANDIDATO - Endpoints GraphQL
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
// TODO: Fix module resolution issue with HistorialCandidatoService
// import { HistorialCandidatoService } from '../../aplicacion/servicios/HistorialCandidatoService';
import { ErrorHandler } from './ErrorHandler';

// Temporary interface to avoid compilation errors - matches public methods only
interface IHistorialCandidatoService {
  obtenerHistorialAplicacion(aplicacionId: string): Promise<any>;
  obtenerHistorialCandidato(candidatoId: string): Promise<any>;
  listarHistorial(filtros?: any): Promise<any>;
  obtenerUltimoCambioEstado(aplicacionId: string): Promise<any>;
  generarEstadisticasConversion(convocatoriaId?: string, fechaDesde?: Date, fechaHasta?: Date): Promise<any>;
  registrarCambio(input: any): Promise<any>;
  limpiarHistorico(fechaLimite: Date): Promise<number>;
}

export class HistorialCandidatoResolver {
  constructor(private historialService: IHistorialCandidatoService) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        obtenerHistorialAplicacion: async (_: any, { aplicacionId }: { aplicacionId: string }) => {
          return await ErrorHandler.handleError(
            () => this.historialService.obtenerHistorialAplicacion(aplicacionId),
            'obtenerHistorialAplicacion',
            { aplicacionId }
          );
        },

        obtenerHistorialCandidato: async (_: any, { candidatoId }: { candidatoId: string }) => {
          return await ErrorHandler.handleError(
            () => this.historialService.obtenerHistorialCandidato(candidatoId),
            'obtenerHistorialCandidato',
            { candidatoId }
          );
        },

        listarHistorial: async (_: any, { filtros }: { filtros?: any }) => {
          return await ErrorHandler.handleError(
            () => this.historialService.listarHistorial(filtros),
            'listarHistorial',
            { filtros }
          );
        },

        obtenerUltimoCambioEstado: async (_: any, { aplicacionId }: { aplicacionId: string }) => {
          return await ErrorHandler.handleError(
            () => this.historialService.obtenerUltimoCambioEstado(aplicacionId),
            'obtenerUltimoCambioEstado',
            { aplicacionId }
          );
        },

        generarEstadisticasConversion: async (_: any, {
          convocatoriaId,
          fechaDesde,
          fechaHasta
        }: {
          convocatoriaId?: string;
          fechaDesde?: Date;
          fechaHasta?: Date;
        }) => {
          return await ErrorHandler.handleError(
            () => this.historialService.generarEstadisticasConversion(
              convocatoriaId,
              fechaDesde,
              fechaHasta
            ),
            'generarEstadisticasConversion',
            { convocatoriaId, fechaDesde, fechaHasta }
          );
        }
      },

      Mutation: {
        registrarCambioHistorial: async (_: any, { input }: { input: any }) => {
          return await ErrorHandler.handleError(
            () => this.historialService.registrarCambio(input),
            'registrarCambioHistorial',
            { input }
          );
        },

        limpiarHistorico: async (_: any, { fechaLimite }: { fechaLimite: Date }) => {
          return await ErrorHandler.handleError(
            () => this.historialService.limpiarHistorico(fechaLimite),
            'limpiarHistorico',
            { fechaLimite }
          );
        }
      }
    };
  }
}