import { Parser, ParserResult } from "../parser.js";

export class JSParser extends Parser {
  constructor({ text = "", ctx = null, parentParser = null, baseDepth = 0, lines = [], x = 0, y = 0, t = 0 }) {
    super({ text, ctx, parentParser, baseDepth, lines, x, y, t });
  }

  parse() {
    let x = this.x;
    let y = this.y;
    let t = this.t;
    let startY = y;
    let ctx = this.ctx;
    let lines = this.lines;

    let buffer = [];
    let end = false;

    while (y < lines.length) {
      console.log("JSParser", lines[y]);
      
      if (startY === y && lines[y].trim().startsWith("```")) {
        y++;
        debugger;
        continue;
      }

      if (lines[y].trim().startsWith("```")) {
        y++;
        console.log("End of JS block");
        end = true;
        break;
      }
      
      buffer.push(lines[y]);
      y++;
    }

    if (end === false) {
      console.log(buffer);
      throw new Error("Unterminated JS block");
    }

    return new ParserResult({
      value: buffer.join("\n"),
      x: x,
      y: y + 1,
      t: t,
    });
  }
  
}