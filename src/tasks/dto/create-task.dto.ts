import { IsString, IsNotEmpty } from 'class-validator';
import { Priority } from 'src/enums/priority.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  priority: Priority;
}
