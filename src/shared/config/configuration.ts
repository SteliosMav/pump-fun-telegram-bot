import { IsEnum, IsNumber, IsString, IsNotEmpty, IsUrl } from "class-validator";

export class Configuration {
  @IsEnum(["development", "production"], {
    message: 'ENV must be either "development" or "production"',
  })
  ENV!: "development" | "production";

  @IsNumber()
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  TELEGRAM_BOT_TOKEN!: string;

  @IsString()
  @IsNotEmpty()
  PERSONAL_TG_ID!: string;

  @IsString()
  MONGO_URI!: string;

  @IsString()
  @IsNotEmpty()
  ENCRYPTION_KEY!: string;

  @IsString()
  @IsNotEmpty()
  BOT_ACCOUNT!: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_PRIVATE_KEY!: string;

  @IsUrl()
  HELIUS_API_STANDARD!: string;

  @IsUrl()
  QUICKNODE_API!: string;
}
