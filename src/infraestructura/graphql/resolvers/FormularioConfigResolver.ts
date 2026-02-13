// ============================================================================
// RESOLVER FORMULARIO CONFIG - Gestión de configuraciones de formulario
// ============================================================================

import { IResolvers } from '@graphql-tools/utils';
import { FormularioConfigService } from '../../../aplicacion/servicios/FormularioConfigService';
import { ErrorHandler } from './ErrorHandler';

export class FormularioConfigResolver {
  constructor(private readonly formularioConfigService: FormularioConfigService) {}

  getResolvers(): IResolvers {
    return {
      Query: {
        formularioConfigPorConvocatoria: async (_: unknown, args: { convocatoriaId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.obtenerConfiguracionPorConvocatoria(args.convocatoriaId),
            'formularioConfigPorConvocatoria',
            { convocatoriaId: args.convocatoriaId }
          );
        },

        formularioConfigPorId: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              const config = await this.formularioConfigService.obtenerConfiguracionPorId(args.id);
              if (!config) {
                throw new Error('Configuración de formulario no encontrada');
              }
              return config;
            },
            'formularioConfigPorId',
            { id: args.id }
          );
        },

        listarFormulariosConfig: async (_: unknown, args: {
          estado?: string;
          creadoPor?: string;
          limit?: number;
          offset?: number;
        }) => {
          return await ErrorHandler.handleError(
            async () => {
              const filtros = {
                estado: args.estado,
                creadoPor: args.creadoPor,
                limit: args.limit || 50,
                offset: args.offset || 0
              };
              return await (this.formularioConfigService as any).listar(filtros);
            },
            'listarFormulariosConfig',
            args
          );
        }
      },

      Mutation: {
        crearFormularioConfig: async (_: unknown, args: { input: any }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.crearConfiguracionPorDefecto(args.input),
            'crearFormularioConfig',
            args.input
          );
        },

        actualizarFormularioConfig: async (_: unknown, args: { id: string; input: any }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.actualizarConfiguracion(args.id, args.input),
            'actualizarFormularioConfig',
            { id: args.id, ...args.input }
          );
        },

        activarFormularioConfig: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.activarConfiguracion(args.id),
            'activarFormularioConfig',
            { id: args.id }
          );
        },

        desactivarFormularioConfig: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.desactivarConfiguracion(args.id),
            'desactivarFormularioConfig',
            { id: args.id }
          );
        },

        agregarCampoFormulario: async (_: unknown, args: { id: string; campo: any }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.agregarCampoPersonalizado(args.id, args.campo),
            'agregarCampoFormulario',
            { id: args.id, campo: args.campo }
          );
        },

        actualizarCampoFormulario: async (_: unknown, args: { id: string; campoId: string; campo: any }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.actualizarCampo(args.id, args.campoId, args.campo),
            'actualizarCampoFormulario',
            { id: args.id, campoId: args.campoId, campo: args.campo }
          );
        },

        eliminarCampoFormulario: async (_: unknown, args: { id: string; campoId: string }) => {
          return await ErrorHandler.handleError(
            async () => await this.formularioConfigService.eliminarCampo(args.id, args.campoId),
            'eliminarCampoFormulario',
            { id: args.id, campoId: args.campoId }
          );
        },

        reordenarCamposFormulario: async (_: unknown, args: { id: string; ordenes: any[] }) => {
          return await ErrorHandler.handleError(
            async () => await (this.formularioConfigService as any).reordenarCampos(args.id, args.ordenes),
            'reordenarCamposFormulario',
            { id: args.id, ordenes: args.ordenes }
          );
        },

        eliminarFormularioConfig: async (_: unknown, args: { id: string }) => {
          return await ErrorHandler.handleError(
            async () => {
              await (this.formularioConfigService as any).eliminar(args.id);
              return true;
            },
            'eliminarFormularioConfig',
            { id: args.id }
          );
        }
      }
    };
  }
}