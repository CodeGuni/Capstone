import { IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {
  @IsNumberString()
  value!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
