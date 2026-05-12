import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class EditingSettingDto {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

class EditingConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditingSettingDto)
  settings: EditingSettingDto[];
}

const parseJson = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const parseEditingConfig = ({ value }: { value: unknown }) => {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch { return value; }
  }
  return plainToInstance(EditingConfigDto, parsed);
};

export class CreatePostDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @Transform(parseEditingConfig)
  @ValidateNested()
  @Type(() => EditingConfigDto)
  editingConfig: EditingConfigDto;

  @IsUUID()
  toolId: string;

  @IsOptional()
  @Transform(parseJson)
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
