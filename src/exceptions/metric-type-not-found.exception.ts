import { NotFoundException } from '@nestjs/common';

export class MetricTypeNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.metricTypeNotFound', error);
  }
}
