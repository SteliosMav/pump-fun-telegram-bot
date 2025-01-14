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
}
