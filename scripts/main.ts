import { NestFactory } from "@nestjs/core";
import { ScriptModule } from "./script.module";
import { SCRIPTS_MAP } from "./scripts-map";

// Get script argument from CLI
const script = process.argv[2];

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(ScriptModule); // Bootstraps ScriptModule

  try {
    if (script in SCRIPTS_MAP) {
      const fn = SCRIPTS_MAP[script];
      await fn(appContext);
    } else {
      const allowedScriptsString = Object.keys(SCRIPTS_MAP).join(", ");
      throw new Error(
        `Script "${script}" not found. Allowed scripts: ${allowedScriptsString}`
      );
    }
  } finally {
    await appContext.close();
  }
}

bootstrap();
