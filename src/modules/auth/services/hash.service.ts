import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IHashService } from '../interfaces/hash-service.interface';

/**
 * Single Responsibility Principle (SRP):
 * HashService is purely responsible for cryptographic hashing & password verification.
 */
@Injectable()
export class HashService implements IHashService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
