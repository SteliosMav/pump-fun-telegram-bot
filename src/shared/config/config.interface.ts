export interface Configuration {
  ENV: "development" | "production";
  PORT: number;
  TELEGRAM_BOT_TOKEN: string;
  PERSONAL_TG_ID: string;
  MONGO_URI: string;
  ENCRYPTION_KEY: string;
  BOT_ACCOUNT: string;
  ADMIN_PRIVATE_KEY: string;
  HELIUS_API_STANDARD: string;
  QUICKNODE_API: string;
}
