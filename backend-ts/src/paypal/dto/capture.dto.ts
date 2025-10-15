import { IsString } from "class-validator";

export class CaptureDto {
  @IsString()
  orderId!: string;
}
