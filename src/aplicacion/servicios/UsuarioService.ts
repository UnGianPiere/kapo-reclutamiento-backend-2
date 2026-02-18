import { UsuarioInput, UsuarioResponse } from '../../dominio/entidades/Usuario';
import { IUsuarioRepository } from '../../dominio/repositorios/IUsuarioRepository';
import { BaseService } from './BaseService';
import { IBaseRepository } from '../../dominio/repositorios/IBaseRepository';
import { PaginationInput, PaginationResult, FilterInput } from '../../dominio/valueObjects/Pagination';

/**
 * Servicio de usuarios que extiende BaseService para mantener consistencia
 * Implementa métodos específicos de IUsuarioRepository además de los métodos base
 */
export class UsuarioService extends BaseService<UsuarioResponse> {
  private readonly usuarioRepository: IUsuarioRepository;
  
  constructor(repository: IUsuarioRepository) {
    // BaseService requiere IBaseRepository, creamos un adaptador mínimo
    super({} as IBaseRepository<UsuarioResponse>);
    this.usuarioRepository = repository;
  }

  async getAllUsuarios(): Promise<UsuarioResponse[]> {
    return await this.usuarioRepository.getAllUsuarios();
  }

  async getUsuario(id: string): Promise<UsuarioResponse | null> {
    return await this.usuarioRepository.getUsuario(id);
  }

  async usuariosCargo(): Promise<UsuarioResponse[]> {
    return await this.usuarioRepository.usuariosCargo();
  }

  async getUsuariosByRegistrosGeneralesContables(): Promise<UsuarioResponse[]> {
    return await this.usuarioRepository.getUsuariosByRegistrosGeneralesContables();
  }

  async createUsuario(data: UsuarioInput): Promise<UsuarioResponse> {
    return await this.usuarioRepository.createUsuario(data);
  }

  async updateUsuario(id: string, data: UsuarioInput): Promise<UsuarioResponse> {
    return await this.usuarioRepository.updateUsuario(id, data);
  }

  async deleteUsuario(id: string): Promise<UsuarioResponse> {
    return await this.usuarioRepository.deleteUsuario(id);
  }

  async listUsuariosPaginatedWithFilters(pagination: PaginationInput, filters?: FilterInput): Promise<PaginationResult<UsuarioResponse>> {
    // Since the repository is HttpAuthRepository, cast and call the method
    const httpRepo = this.usuarioRepository as any; // Cast to access the method
    return await httpRepo.listUsuariosPaginatedWithFilters(pagination, filters);
  }
}

