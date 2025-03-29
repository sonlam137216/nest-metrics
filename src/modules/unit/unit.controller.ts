import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UnitDto } from './dto/unit.dto';
import { CreateUnitDto } from './dto/create-unit.dto';

@Controller('units')
@ApiTags('Units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: UnitDto })
  async create(@Body() createUnitDto: CreateUnitDto) {
    const newUnit = await this.unitService.create(createUnitDto);

    return newUnit;
  }

  @Get()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiResponse({ type: [UnitDto] })
  async findAll() {
    const units = await this.unitService.findAll();

    return units;
  }
}
