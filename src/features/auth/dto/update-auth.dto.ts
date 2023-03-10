import { PartialType } from '@nestjs/mapped-types';
import { AuthCredentialDto } from './auth-credential.dto';

export class UpdateAuthDto extends PartialType(AuthCredentialDto) {}
