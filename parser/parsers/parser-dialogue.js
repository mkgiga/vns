import Parser from "../parser.js";

export class DialogueParser extends Parser {
  constructor({
    text = "",
    startPattern = /\[/g,
    stopPattern = /\]/g,
  }) {
    super({ stopPattern, startPattern, text });
  }

  parse() {
    const text = this.text;
  }
}

export default DialogueParser;