import "reflect-metadata";

/** 
 * @example

// Initialize container
const container = new DependencyContainer();

// Register dependencies
container.register(new ProxyRotator());
container.register(new PumpFunService());
container.register(new CommentGenerator());
container.register(
  new AccountGenerator(
    container.resolve(ProxyRotator),
    container.resolve(PumpFunService)
  )
);

// Resolve dependencies
const tokenCreatedController = new TokenCreatedController(
  container.resolve(ProxyRotator),
  container.resolve(PumpFunService),
  container.resolve(CommentGenerator),
  container.resolve(AccountGenerator)
);

*/

export class DependencyContainer {
  private instances = new Map<string, object>();

  // Register using only the instance
  register(instance: object): void {
    const key = instance.constructor.name;
    this.instances.set(key, instance);
  }

  // Resolve by class reference
  resolve<T>(ClassRef: new (...args: any[]) => T): T {
    const key = ClassRef.name;
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`Dependency ${key} not found in container.`);
    }
    return instance as T;
  }

  // Bootstrap application with the main class
  inject<T>(MainClass: new (...args: any[]) => T): T {
    this.registerDependencies();
    return this.createInstance(MainClass);
  }

  // Register all dependencies (internal method)
  private registerDependencies(): void {
    // Add your dependency registrations here
    this.register(new ProxyRotator());
    this.register(new PumpFunService());
    this.register(new CommentGenerator());
    this.register(
      new AccountGenerator(
        this.resolve(ProxyRotator),
        this.resolve(PumpFunService)
      )
    );
  }

  // Create an instance of the main class with resolved dependencies
  private createInstance<T>(ClassRef: new (...args: any[]) => T): T {
    const paramTypes = Reflect.getMetadata("design:paramtypes", ClassRef) || [];
    const dependencies = paramTypes.map((param: any) => this.resolve(param));
    return new ClassRef(...dependencies);
  }
}
