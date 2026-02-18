// ============================================================================
// RESOLVER ENTREVISTA REGULAR - Queries y Mutations para entrevistas presenciales
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { EntrevistaRegularService } from '../../../aplicacion/servicios/EntrevistaRegularService';
import { CrearEntrevistaRegularInput, ActualizarEntrevistaRegularInput, TipoEntrevista } from '../../../dominio/entidades/EntrevistaRegular';
import { ErrorHandler } from './ErrorHandler';

export class EntrevistaRegularResolver {
  constructor(
    private readonly entrevistaService: EntrevistaRegularService
  ) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        obtenerEntrevistaRegular: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.obtenerPorId(args.id),
            'obtenerEntrevistaRegular',
            args
          );
        },

        obtenerEntrevistaRegularPorAplicacion: async (_: unknown, args: {
          aplicacionCandidatoId: string;
          tipo_entrevista: TipoEntrevista;
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.obtenerPorAplicacionYTipo(
              args.aplicacionCandidatoId,
              args.tipo_entrevista
            ),
            'obtenerEntrevistaRegularPorAplicacion',
            args
          );
        },

        listarEntrevistasRegulares: async (_: unknown, args: {
          filtros?: {
            aplicacionCandidatoId?: string;
            candidatoId?: string;
            tipo_entrevista?: TipoEntrevista;
            entrevistador_id?: string;
            fechaDesde?: Date;
            fechaHasta?: Date;
            limit?: number;
            offset?: number;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.listar(args.filtros),
            'listarEntrevistasRegulares',
            args
          );
        },

        contarEntrevistasRegulares: async (_: unknown, args: {
          filtros?: {
            aplicacionCandidatoId?: string;
            candidatoId?: string;
            tipo_entrevista?: TipoEntrevista;
            entrevistador_id?: string;
            fechaDesde?: Date;
            fechaHasta?: Date;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.contar(args.filtros),
            'contarEntrevistasRegulares',
            args
          );
        },

        existeEntrevistaRegular: async (_: unknown, args: {
          aplicacionCandidatoId: string;
          tipo_entrevista: TipoEntrevista;
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.existeEntrevistaParaAplicacionYTipo(
              args.aplicacionCandidatoId,
              args.tipo_entrevista
            ),
            'existeEntrevistaRegular',
            args
          );
        },
      },

      Mutation: {
        crearEntrevistaRegular: async (_: unknown, args: { input: CrearEntrevistaRegularInput }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.crear(args.input),
            'crearEntrevistaRegular',
            args
          );
        },

        actualizarEntrevistaRegular: async (_: unknown, args: { id: string; input: ActualizarEntrevistaRegularInput }) => {
          return await ErrorHandler.handleError(
            async () => {
              const result = await this.entrevistaService.actualizar(args.id, args.input);
              if (!result) {
                throw new Error(`Entrevista regular con ID ${args.id} no encontrada`);
              }
              return result;
            },
            'actualizarEntrevistaRegular',
            args
          );
        },

        eliminarEntrevistaRegular: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.entrevistaService.eliminar(args.id),
            'eliminarEntrevistaRegular',
            args
          );
        },
      },
    };
  }
}