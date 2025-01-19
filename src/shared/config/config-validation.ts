import * as Joi from "joi";
import { Configuration } from "./config.interface";

export const configValidationSchema = Joi.object<Configuration>({
  ENV: Joi.string().valid("development", "production").required(),
  PORT: Joi.number().required(),
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  PERSONAL_TG_ID: Joi.string().required(),
  MONGO_URI: Joi.string().uri().required(),
  ENCRYPTION_KEY: Joi.string().required(),
  BOT_ACCOUNT: Joi.string().required(),
  ADMIN_PRIVATE_KEY: Joi.string().required(),
  HELIUS_API_STANDARD: Joi.string().uri().required(),
  QUICKNODE_API: Joi.string().uri().required(),
});
