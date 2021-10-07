const parser = require("@asyncapi/parser");

module.exports = {
  validateSpecFiles
};


async function validateSpecFiles(files) {
  try {
    for (var index in files) {
      await parser.parse(files[index].raw);
    }
  } catch (error) {
    throw error;
  }
}
