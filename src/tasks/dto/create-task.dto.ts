import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Priority } from 'src/enums/priority.enum';

export class CreateTaskDto {
  id: number;
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(Priority, { message: 'Invalid priority value' })
  @IsString()
  @IsNotEmpty()
  priority: Priority;

  filePath?: string;
}
