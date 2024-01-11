import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
export enum SortEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}
export class SortRequestDto {
  @ApiPropertyOptional({ enum: SortEnum })
  @IsOptional()
  @IsEnum(SortEnum)
  sortType?: SortEnum = SortEnum.DESC;

  @IsOptional()
  sort?: 'title' | 'priority';
}
