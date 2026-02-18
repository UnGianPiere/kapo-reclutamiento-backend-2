// ============================================================================
// RESOLVER COMUNICACION ENTRADA - Queries y Mutations para comunicaciones de entrada
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { ComunicacionEntradaService } from '../../../aplicacion/servicios/ComunicacionEntradaService';
import {
  CrearComunicacionEntradaInput,
  ActualizarComunicacionEntradaInput
} from '../../../dominio/entidades/ComunicacionEntrada';
import { ErrorHandler } from './ErrorHandler';

export class ComunicacionEntradaResolver {
  constructor(
    private readonly comunicacionEntradaService: ComunicacionEntradaService
  ) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        obtenerComunicacionEntradaPorAplicacion: async (_: unknown, args: {
          aplicacionCandidatoId: string;
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.comunicacionEntradaService.obtenerPorAplicacion(
              args.aplicacionCandidatoId
            ),
            'obtenerComunicacionEntradaPorAplicacion',
            args
          );
        }
      },

      Mutation: {
        crearComunicacionEntrada: async (_: unknown, args: {
          input: CrearComunicacionEntradaInput;
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.comunicacionEntradaService.crear(args.input),
            'crearComunicacionEntrada',
            args
          );
        },

        actualizarComunicacionEntrada: async (_: unknown, args: {
          id: string;
          input: ActualizarComunicacionEntradaInput;
        }) => {
          return await ErrorHandler.handleError(
            async () => await this.comunicacionEntradaService.actualizar(args.id, args.input),
            'actualizarComunicacionEntrada',
            args
          );
        }
      }
    };
  }
}
