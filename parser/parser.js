/**
 * @fileoverview parser.js - The base parser class for translating .vns files into runtime instructions for `VNEngine`. @see {@link "../vns.js"}
 * @version 0.1.0
 * @license MIT
 * @exports Parser
 */

/**
 * @typedef VNContext
 * @property {VNContext | null} parent If this context is a child of another context
 * @property {string} name The name of the context
 * @property {VNInstruction[]} body The instructions of the context
 * @property {Object.<string, any>} variables Variables, including functions
 * @property {string[]} parameters Parameters of the context
 * @property {Object.<string, any>} options
 * @property {string} condition The condition for the context to be executed, evaluated as a boolean at runtime
 * @property {any} value
 */

/**
 * @typedef VNInstruction
 * @property {string} name The name of the instruction, will be resolved to a function which is defined in the engine
 * @property {{ [key: string]: any }} params The parameters of the instruction
 * @property {{ [key: string]: any }} meta Metadata (reserved for future use)
 */

/**
 * Base class for all parsers. Every parser can instantiate a version of other parsers that parse
 * certain parts of the script, and because each context is different, the parser that creates the
 * child parser can pass the necessary stop or start patterns to indicate that the child parser should
 * start parsing or return the parsed data.
 * @abstract
 */
export class Parser {
  /**
   * Creates an instance of Parser.
   * @param {{
   *  text: string,
   *  ctx: VNContext | null,
   *  parentParser: Parser | null,
   *  baseDepth: number
   * }} options
   */
  constructor({ text = "", ctx = null, parentParser = null, lines = [], y = 0, x = 0, t = 0 }) {
    
    if (lines.length > 0) {
      this.lines = lines;
    } else {
      this.text = text;
      this.lines = text.split("\n");
    }

    this.ctx = ctx;
    this.parentParser = parentParser;
    
    this.y = y;
    this.x = x;
    this.t = t;
    
    this.baseDepth = t;
  }

  /**
   * @type {VNContext | null}
   */
  ctx = null;

  buffer = "";
  
  state = {
    
  }

  /**
   * All the lines of the text.
   * @type {string[]}
   */
  lines = [];

  /**
   * Parses a string of text and returns the result.
   * @abstract
   * @param {string} text
   * @returns {any}
   */
  parse() {
    throw new Error("Not implemented");
  }

  /**
   * Looks ahead n characters in the text.
   * n may be a positive or negative integer.
   * @param {number} i The index to start looking ahead from
   * @param {number} n The number of characters to look ahead
   * @returns {string}
   */
  peek(i = 0, n = 0) {
    return this.text[i + n] || "";
  }

  /**
   * Reads until a pattern is matched.
   * @param {number} i The index to start reading from
   * @param {RegExp} pattern The pattern to match
   * @returns {string}
   */
  readUntil(i = 0, pattern) {
    let buf = "";
    
    for (i; i < this.text.length; i++) {
      const c = this.text[i];
      if (pattern.test(c)) {
        break;
      }
      buf += c;
    }

    return buf;
  }

  /**
   * Get the indentation depth of a line.
   * @param {string} line The line to get the depth of
   * @param {number} y The line number
   * @returns {number}
   * @throws {Error} If the indentation is invalid
   */
  getDepth(line = "", y = 0) {
    let t = 0;

    for (let i = 0; i < line.length; i++) {
      if (line[i] === " ") {
        t++;
      } else {
        break;
      }
    }

    if (t % 2 !== 0) {
      return new ParserResult({
        error: {
          friendly: `Invalid indentation at line ${y + 1}`,
          nerd: `Invalid indentation at line ${y + 1}, expected an even number of spaces, but got ${t}`,
        }
      });
    }

    return t / 2;
  }

  /**
   * Lookahead, but returns a range of characters.
   * @param {number} i The index to start looking ahead from
   * @param {number} from The number of characters to look ahead from
   * @param {number} to The number of characters to look ahead to
   * @returns {string}
   */
  range(i = 0, from = 0, to = 0) {
    return this.text.slice(i + from, i + to);
  }

  create = {
    context: this.context,
    instruction: this.instruction,
  };

  context({
    parent = null,
    depth = 0,
    name = "context",
    body = [],
    variables = {},
    parameters = [],
    options = {},
    condition = "true",
    value = undefined,
  }) {
    return {
      parent,
      name,
      body,
      variables,
      parameters,
      options,
      condition,
      value,
    };
  }

  instruction({ name = "engine.context.goto", params = {}, meta = {} }) {
    return {
      name,
      params,
      meta,
    };
  }
}

/**
 * Any given parser should return a ParserResult object
 * so that the caller parser can know what was parsed,
 * and where to continue parsing.
 * 
 * If the syntax is invalid or other errors occur, the
 * parser should return undefined.
 */
export class ParserResult {
  constructor({ value = null, y = 0, x = 0, error = undefined }) {
    this.value = value;
    this.y = y;
    this.x = x;
    this.error = error;
  }
}

export default {
  Parser,
  ParserResult,
};
