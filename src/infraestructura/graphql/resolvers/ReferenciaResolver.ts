// ============================================================================
// RESOLVER REFERENCIA - Queries y Mutations para referencias de candidatos
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { ReferenciaService } from '../../../aplicacion/servicios/ReferenciaService';
import { CrearReferenciaInput, ActualizarReferenciaInput } from '../../../dominio/entidades/Referencia';
import { ErrorHandler } from './ErrorHandler';

export class ReferenciaResolver {
  constructor(
    private readonly referenciaService: ReferenciaService
  ) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        obtenerReferencia: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.referenciaService.obtenerPorId(args.id),
            'obtenerReferencia',
            args
          );
        },

        listarReferencias: async (_: unknown, args: {
          filtros?: {
            aplicacionCandidatoId?: string;
            candidatoId?: string;
            empresa?: string;
            limit?: number;
            offset?: number;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.referenciaService.listar(args.filtros),
            'listarReferencias',
            args
          );
        },

        contarReferencias: async (_: unknown, args: {
          filtros?: {
            aplicacionCandidatoId?: string;
            candidatoId?: string;
            empresa?: string;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.referenciaService.contar(args.filtros),
            'contarReferencias',
            args
          );
        },

        listarReferenciasPorAplicacion: async (_: unknown, args: { aplicacionCandidatoId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.referenciaService.listarPorAplicacion(args.aplicacionCandidatoId),
            'listarReferenciasPorAplicacion',
            args
          );
        },
      },

      Mutation: {
        crearReferencia: async (_: unknown, args: { input: CrearReferenciaInput }) => {
          return await ErrorHandler.handleError(
            async () => await this.referenciaService.crear(args.input),
            'crearReferencia',
            args
          );
        },

        actualizarReferencia: async (_: unknown, args: { id: string; input: ActualizarReferenciaInput }) => {
          return await ErrorHandler.handleError(
            async () => {
              const result = await this.referenciaService.actualizar(args.id, args.input);
              if (!result) {
                throw new Error(`Referencia con ID ${args.id} no encontrada`);
              }
              return result;
            },
            'actualizarReferencia',
            args
          );
        },

        eliminarReferencia: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.referenciaService.eliminar(args.id),
            'eliminarReferencia',
            args
          );
        },
      },
    };
  }
}