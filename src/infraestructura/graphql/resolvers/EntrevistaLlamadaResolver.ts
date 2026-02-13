// ============================================================================
// RESOLVER ENTREVISTA LLAMADA - Queries y Mutations para entrevistas telefónicas
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { EntrevistaLlamadaService } from '../../../aplicacion/servicios/EntrevistaLlamadaService';
import { CrearEntrevistaInput, ActualizarEntrevistaInput } from '../../../dominio/entidades/EntrevistaLlamada';
import { ErrorHandler } from './ErrorHandler';

export class EntrevistaLlamadaResolver {
  constructor(
    private readonly entrevistaService: EntrevistaLlamadaService
  ) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        obtenerEntrevista: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.obtenerPorId(args.id),
            'obtenerEntrevista',
            args
          );
        },

        obtenerEntrevistaPorAplicacionCandidato: async (_: unknown, args: { aplicacionCandidatoId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.obtenerPorAplicacionCandidatoId(args.aplicacionCandidatoId),
            'obtenerEntrevistaPorAplicacionCandidato',
            args
          );
        },

        listarEntrevistas: async (_: unknown, args: {
          filtros?: {
            aplicacionId?: string;
            entrevistador_id?: string;
            fechaDesde?: Date;
            fechaHasta?: Date;
            limit?: number;
            offset?: number;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.listar(args.filtros),
            'listarEntrevistas',
            args
          );
        },

        contarEntrevistas: async (_: unknown, args: {
          filtros?: {
            aplicacionId?: string;
            entrevistador_id?: string;
            fechaDesde?: Date;
            fechaHasta?: Date;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.contar(args.filtros),
            'contarEntrevistas',
            args
          );
        },

        existeEntrevistaParaAplicacionCandidato: async (_: unknown, args: { aplicacionCandidatoId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.existeEntrevistaParaAplicacion(args.aplicacionCandidatoId),
            'existeEntrevistaParaAplicacionCandidato',
            args
          );
        },
      },

      Mutation: {
        crearEntrevista: async (_: unknown, args: { input: CrearEntrevistaInput }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.crear(args.input),
            'crearEntrevista',
            args
          );
        },

        actualizarEntrevista: async (_: unknown, args: { id: string; input: ActualizarEntrevistaInput }) => {
          return await ErrorHandler.handleError(
            async () => {
              const result = await this.entrevistaService.actualizar(args.id, args.input);
              if (!result) {
                throw new Error(`Entrevista con ID ${args.id} no encontrada`);
              }
              return result;
            },
            'actualizarEntrevista',
            args
          );
        },

        eliminarEntrevista: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.eliminar(args.id),
            'eliminarEntrevista',
            args
          );
        },
      },
    };
  }
}