import { IsString } from "class-validator";

export class EncryptedPrivateKeyDto {
  @IsString()
  encryptedPrivateKey!: string;
}
