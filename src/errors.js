class InvalidInputError extends Error {
  constructor(){
    super('Invalid Input');
    this.name = 'Invalid Input'
  }
}

class InvalidFilePathError extends Error {
  constructor(filepath) {
    super(`${filepath}: no such file`);
    this.name = 'Invalid File Path';
  }
}

module.exports = {
  InvalidInputError,
  InvalidFilePathError
}