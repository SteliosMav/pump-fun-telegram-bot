import { OnModuleInit, Injectable, Logger } from "@nestjs/common";
import { HandlerRegistry } from "./handler-registry.service";
import { DiscoveryService, Reflector } from "@nestjs/core";
import { HANDLER_METADATA } from "./handler.decorator";

@Injectable()
export class HandlerLoaderService implements OnModuleInit {
  private readonly logger = new Logger(HandlerLoaderService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly handlerRegistry: HandlerRegistry
  ) {}

  onModuleInit() {
    // Discover all providers with the HANDLER_METADATA
    const handlers = this.discoveryService.getProviders().filter((wrapper) => {
      // Ensure `metatype` exists and is a class or function
      if (!wrapper.metatype || typeof wrapper.metatype !== "function") {
        return false;
      }
      const metadata = this.reflector.get(HANDLER_METADATA, wrapper.metatype);
      return !!metadata;
    });

    // Register each handler in the HandlerRegistry
    for (const handler of handlers) {
      if (!handler.metatype || typeof handler.metatype !== "function") {
        return false;
      }
      const metadata = this.reflector.get(HANDLER_METADATA, handler.metatype);
      const { command } = metadata;
      const instance = handler.instance;

      if (instance && typeof instance.handle === "function") {
        this.handlerRegistry.registerHandler(
          command,
          instance.handle.bind(instance)
        );
        this.logger.log(`Registered handler for command: ${command}`);
      } else {
        this.logger.warn(
          `Handler for command "${command}" is missing a handle method.`
        );
      }
    }
  }
}
