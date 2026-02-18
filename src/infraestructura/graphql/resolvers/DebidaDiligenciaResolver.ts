// ============================================================================
// RESOLVER DEBIDA DILIGENCIA - Queries y Mutations para evaluaciones de debida diligencia
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { DebidaDiligenciaService } from '../../../aplicacion/servicios/DebidaDiligenciaService';
import { CrearDebidaDiligenciaInput, ActualizarDebidaDiligenciaInput, NivelRiesgo } from '../../../dominio/entidades/DebidaDiligencia';
import { ErrorHandler } from './ErrorHandler';

export class DebidaDiligenciaResolver {
  constructor(
    private readonly debidaDiligenciaService: DebidaDiligenciaService
  ) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        obtenerDebidaDiligencia: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.debidaDiligenciaService.obtenerPorId(args.id),
            'obtenerDebidaDiligencia',
            args
          );
        },

        obtenerDebidaDiligenciaPorAplicacion: async (_: unknown, args: {
          aplicacionCandidatoId: string;
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.debidaDiligenciaService.obtenerPorAplicacion(
              args.aplicacionCandidatoId
            ),
            'obtenerDebidaDiligenciaPorAplicacion',
            args
          );
        },

        listarDebidasDiligencias: async (_: unknown, args: {
          filtros?: {
            aplicacionCandidatoId?: string;
            candidatoId?: string;
            evaluador_id?: string;
            nivel_riesgo?: NivelRiesgo;
            fechaDesde?: Date;
            fechaHasta?: Date;
            limit?: number;
            offset?: number;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.debidaDiligenciaService.listar(args.filtros),
            'listarDebidasDiligencias',
            args
          );
        },

        contarDebidasDiligencias: async (_: unknown, args: {
          filtros?: {
            aplicacionCandidatoId?: string;
            candidatoId?: string;
            evaluador_id?: string;
            nivel_riesgo?: NivelRiesgo;
            fechaDesde?: Date;
            fechaHasta?: Date;
          };
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.debidaDiligenciaService.contar(args.filtros),
            'contarDebidasDiligencias',
            args
          );
        },

        existeDebidaDiligencia: async (_: unknown, args: {
          aplicacionCandidatoId: string;
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.debidaDiligenciaService.existeEvaluacionParaAplicacion(
              args.aplicacionCandidatoId
            ),
            'existeDebidaDiligencia',
            args
          );
        },
      },

      Mutation: {
        crearDebidaDiligencia: async (_: unknown, args: { input: CrearDebidaDiligenciaInput }) => {
          return await ErrorHandler.handleError(
            async () => await this.debidaDiligenciaService.crear(args.input),
            'crearDebidaDiligencia',
            args
          );
        },

        actualizarDebidaDiligencia: async (_: unknown, args: { id: string; input: ActualizarDebidaDiligenciaInput }) => {
          return await ErrorHandler.handleError(
            async () => {
              const result = await this.debidaDiligenciaService.actualizar(args.id, args.input);
              if (!result) {
                throw new Error(`Evaluación de debida diligencia con ID ${args.id} no encontrada`);
              }
              return result;
            },
            'actualizarDebidaDiligencia',
            args
          );
        },

        eliminarDebidaDiligencia: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.debidaDiligenciaService.eliminar(args.id),
            'eliminarDebidaDiligencia',
            args
          );
        },
      },
    };
  }
}
