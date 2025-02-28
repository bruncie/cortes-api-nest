import { IsUrl, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ClipDto {
  startTime: number;
  endTime: number;
}

export class VideoRequestDto {
  @IsUrl()
  url: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ClipDto)
  clips: ClipDto[];
}