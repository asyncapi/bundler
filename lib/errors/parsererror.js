class ParserError extends Error {
  constructor({type, title}){
    super();
    this.message = title
    this.name = type
  }
}

module.exports = ParserError