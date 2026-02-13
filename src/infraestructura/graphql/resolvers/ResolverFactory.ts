// ============================================================================
// FACTORY PATTERN OPTIMIZADO - Configuración Declarativa de Resolvers
// ============================================================================

import { scalarResolvers } from './scalars';

// Importar resolvers de autenticación
import { AuthResolver } from './AuthResolver';
import { UsuarioResolver } from './UsuarioResolver';
import { ConvocatoriaResolver } from './ConvocatoriaResolver';
import { FormularioConfigResolver } from './FormularioConfigResolver';
import { AplicacionCandidatoResolver } from './AplicacionCandidatoResolver';
import { EntrevistaLlamadaResolver } from './EntrevistaLlamadaResolver';
import { HistorialCandidatoResolver } from './HistorialCandidatoResolver';

// Importar servicios
import { AuthService } from '../../../aplicacion/servicios/AuthService';
import { UsuarioService } from '../../../aplicacion/servicios/UsuarioService';
import { ConvocatoriaService } from '../../../aplicacion/servicios/ConvocatoriaService';
import { FormularioConfigService } from '../../../aplicacion/servicios/FormularioConfigService';
import { AplicacionService } from '../../../aplicacion/servicios/AplicacionService';
import { CandidatoService } from '../../../aplicacion/servicios/CandidatoService';
import { EntrevistaLlamadaService } from '../../../aplicacion/servicios/EntrevistaLlamadaService';
import { HistorialCandidatoService } from '../../../aplicacion/servicios/HistorialCandidatoService';

// Importar repositorios HTTP
import { HttpAuthRepository } from '../../persistencia/http/HttpAuthRepository';

// Importar repositorios MongoDB
import { UsuarioMongoRepository } from '../../persistencia/mongo/UsuarioMongoRepository';
import { ConvocatoriaMongoRepository } from '../../persistencia/mongo/ConvocatoriaMongoRepository';
import { FormularioConfigMongoRepository } from '../../persistencia/mongo/FormularioConfigMongoRepository';
import { CandidatoMongoRepository } from '../../persistencia/mongo/CandidatoMongoRepository';
import { AplicacionCandidatoMongoRepository } from '../../persistencia/mongo/AplicacionCandidatoMongoRepository';
import { EntrevistaLlamadaMongoRepository } from '../../persistencia/mongo/EntrevistaLlamadaMongoRepository';
import { HistorialCandidatoMongoRepository } from '../../persistencia/mongo/HistorialCandidatoMongoRepository';

// Importar Container para DI
import { Container } from '../../di/Container';

// Importar Logger
import { logger } from '../../logging';

/**
 * Factory para crear resolvers de autenticación
 * Mantiene solo lo esencial: Auth y Usuario
 */
export class ResolverFactory {
  /**
   * Container para inyección de dependencias
   */
  private static container: Container | null = null;

  /**
   * Obtener instancia del Container e inicializar dependencias
   */
  private static getContainer(): Container {
    if (!this.container) {
      this.container = Container.getInstance();
      this.initializeContainer();
    }
    return this.container;
  }

  /**
   * Inicializar todas las dependencias en el Container
   */
  private static initializeContainer(): void {
    const container = this.getContainer();

    // Registrar HttpAuthRepository
    container.register('HttpAuthRepository', () => new HttpAuthRepository(), true);

    // Registrar UsuarioMongoRepository
    container.register('UsuarioMongoRepository', () => new UsuarioMongoRepository(), true);

    // Registrar ConvocatoriaMongoRepository
    container.register('ConvocatoriaMongoRepository', () => new ConvocatoriaMongoRepository(), true);

    // Registrar FormularioConfigMongoRepository
    container.register('FormularioConfigMongoRepository', () => new FormularioConfigMongoRepository(), true);

    // Registrar CandidatoMongoRepository
    container.register('CandidatoMongoRepository', () => new CandidatoMongoRepository(), true);

    // Registrar AplicacionCandidatoMongoRepository
    container.register('AplicacionCandidatoMongoRepository', () => new AplicacionCandidatoMongoRepository(), true);

    // Registrar EntrevistaLlamadaMongoRepository
    container.register('EntrevistaLlamadaMongoRepository', () => new EntrevistaLlamadaMongoRepository(), true);

    // Registrar HistorialCandidatoMongoRepository
    container.register('HistorialCandidatoMongoRepository', () => new HistorialCandidatoMongoRepository(), true);

    // Registrar AuthService
    container.register('AuthService', (c) => {
      const httpAuthRepo = c.resolve<HttpAuthRepository>('HttpAuthRepository');
      return new AuthService(httpAuthRepo);
    }, true);

    // Registrar UsuarioService
    container.register('UsuarioService', (c) => {
      const usuarioRepo = c.resolve<UsuarioMongoRepository>('UsuarioMongoRepository');
      return new UsuarioService(usuarioRepo);
    }, true);

    // Registrar AuthResolver
    container.register('AuthResolver', (c) => {
      const authService = c.resolve<AuthService>('AuthService');
      return new AuthResolver(authService);
    }, true);

    // Registrar UsuarioResolver
    container.register('UsuarioResolver', (c) => {
      const usuarioService = c.resolve<UsuarioService>('UsuarioService');
      return new UsuarioResolver(usuarioService);
    }, true);

    // Registrar ConvocatoriaService
    container.register('ConvocatoriaService', (c) => {
      const convocatoriaRepo = c.resolve<ConvocatoriaMongoRepository>('ConvocatoriaMongoRepository');
      return new ConvocatoriaService(convocatoriaRepo);
    }, true);

    // Registrar FormularioConfigService
    container.register('FormularioConfigService', (c) => {
      const formularioConfigRepo = c.resolve<FormularioConfigMongoRepository>('FormularioConfigMongoRepository');
      return new FormularioConfigService(formularioConfigRepo);
    }, true);

    // Registrar ConvocatoriaResolver
    container.register('ConvocatoriaResolver', (c) => {
      const convocatoriaService = c.resolve<ConvocatoriaService>('ConvocatoriaService');
      return new ConvocatoriaResolver(convocatoriaService);
    }, true);

    // Registrar FormularioConfigResolver
    container.register('FormularioConfigResolver', (c) => {
      const formularioConfigService = c.resolve<FormularioConfigService>('FormularioConfigService');
      return new FormularioConfigResolver(formularioConfigService);
    }, true);

    // Registrar CandidatoService
    container.register('CandidatoService', (c) => {
      const candidatoRepo = c.resolve<CandidatoMongoRepository>('CandidatoMongoRepository');
      return new CandidatoService(candidatoRepo);
    }, true);

    // Registrar AplicacionService
    container.register('AplicacionService', (c) => {
      const candidatoRepo = c.resolve<CandidatoMongoRepository>('CandidatoMongoRepository');
      const aplicacionRepo = c.resolve<AplicacionCandidatoMongoRepository>('AplicacionCandidatoMongoRepository');
      return new AplicacionService(candidatoRepo, aplicacionRepo);
    }, true);

    // Registrar EntrevistaLlamadaService
    container.register('EntrevistaLlamadaService', (c) => {
      const entrevistaRepo = c.resolve<EntrevistaLlamadaMongoRepository>('EntrevistaLlamadaMongoRepository');
      const aplicacionRepo = c.resolve<AplicacionCandidatoMongoRepository>('AplicacionCandidatoMongoRepository');
      return new EntrevistaLlamadaService(entrevistaRepo, aplicacionRepo);
    }, true);

    // Registrar HistorialCandidatoService
    container.register('HistorialCandidatoService', (c) => {
      const historialRepo = c.resolve<HistorialCandidatoMongoRepository>('HistorialCandidatoMongoRepository');
      const aplicacionRepo = c.resolve<AplicacionCandidatoMongoRepository>('AplicacionCandidatoMongoRepository');
      return new HistorialCandidatoService(historialRepo, aplicacionRepo);
    }, true);

    // Registrar AplicacionCandidatoResolver
    container.register('AplicacionCandidatoResolver', (c) => {
      const aplicacionService = c.resolve<AplicacionService>('AplicacionService');
      const candidatoService = c.resolve<CandidatoService>('CandidatoService');
      const convocatoriaService = c.resolve<ConvocatoriaService>('ConvocatoriaService');
      return new AplicacionCandidatoResolver(aplicacionService, candidatoService, convocatoriaService);
    }, true);

    // Registrar EntrevistaLlamadaResolver
    container.register('EntrevistaLlamadaResolver', (c) => {
      const entrevistaService = c.resolve<EntrevistaLlamadaService>('EntrevistaLlamadaService');
      return new EntrevistaLlamadaResolver(entrevistaService);
    }, true);

    // Registrar HistorialCandidatoResolver
    container.register('HistorialCandidatoResolver', (c) => {
      const historialService = c.resolve<HistorialCandidatoService>('HistorialCandidatoService');
      return new HistorialCandidatoResolver(historialService);
    }, true);

    logger.info('Container inicializado con dependencias de autenticación, usuarios, convocatorias, formularios, entrevistas e historial');
  }

  /**
   * Crea todos los resolvers usando Container para inyección de dependencias
   * @returns Array de resolvers GraphQL
   */
  static createResolvers(): unknown[] {
    const resolvers: unknown[] = [scalarResolvers];
    const container = this.getContainer();

    try {
      // Crear AuthResolver
      const authResolver = container.resolve<AuthResolver>('AuthResolver');
      resolvers.push(authResolver.getResolvers());
      logger.debug('Resolver configurado: auth');

      // Crear UsuarioResolver
      const usuarioResolver = container.resolve<UsuarioResolver>('UsuarioResolver');
      resolvers.push(usuarioResolver.getResolvers());
      logger.debug('Resolver configurado: usuario');

      // Crear ConvocatoriaResolver
      const convocatoriaResolver = container.resolve<ConvocatoriaResolver>('ConvocatoriaResolver');
      resolvers.push(convocatoriaResolver.getResolvers());
      logger.debug('Resolver configurado: convocatoria');

      // Crear FormularioConfigResolver
      const formularioConfigResolver = container.resolve<FormularioConfigResolver>('FormularioConfigResolver');
      resolvers.push(formularioConfigResolver.getResolvers());
      logger.debug('Resolver configurado: formulario-config');

      // Crear AplicacionCandidatoResolver
      const aplicacionCandidatoResolver = container.resolve<AplicacionCandidatoResolver>('AplicacionCandidatoResolver');
      resolvers.push(aplicacionCandidatoResolver.getResolvers());
      logger.debug('Resolver configurado: aplicacion-candidato');

      // Crear EntrevistaLlamadaResolver
      const entrevistaLlamadaResolver = container.resolve<EntrevistaLlamadaResolver>('EntrevistaLlamadaResolver');
      resolvers.push(entrevistaLlamadaResolver.getResolvers());
      logger.debug('Resolver configurado: entrevista-llamada');

      // Crear HistorialCandidatoResolver
      const historialCandidatoResolver = container.resolve<HistorialCandidatoResolver>('HistorialCandidatoResolver');
      resolvers.push(historialCandidatoResolver.getResolvers());
      logger.debug('Resolver configurado: historial-candidato');
    } catch (error) {
      logger.error('Error configurando resolvers', {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    logger.info(`Total de resolvers configurados: ${resolvers.length}`);
    return resolvers;
  }
}
