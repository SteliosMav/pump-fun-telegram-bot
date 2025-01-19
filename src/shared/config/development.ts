// shared/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGO_URI,
  environment: process.env.ENV || "development",
  quicknodeApi: process.env.QUICKNODE_API || "",
  heliusApiStandard: process.env.HELIUS_API_STANDARD || "",
});
