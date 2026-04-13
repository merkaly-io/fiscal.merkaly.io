export abstract class AbstractParser<TInput> {
  public abstract parse(input: TInput): Promise<string>;
}
