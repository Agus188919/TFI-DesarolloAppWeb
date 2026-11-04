import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../../entities/enums.js';
import { ROLES_KEY } from '../guards/roles.guard.js';

export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);