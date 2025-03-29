import { NotFoundException } from '@nestjs/common';

export class UnitNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.unitNotFound', error);
  }
}
