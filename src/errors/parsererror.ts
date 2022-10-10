export class ParserError extends Error {
  constructor({ type, title }: { type: string; title: string }) {
    super();
    this.message = title;
    this.name = type;
  }
}
