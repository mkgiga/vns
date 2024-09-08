import { VNContext } from "@classes/vn-context";
import { VNProject } from "@classes/vn-project"
import { error, log } from "@/util/debug";

import {
  VNValue,
  HTMLVNScriptElementOptions,
  PreprocessedLine,
  VNFunctionArgument,
  ParserStringMap,
} from "@types";

export class HTMLVNScriptElement extends HTMLElement {

  targetSceneContainerDiv: HTMLElement | null = null;
  currentProject: VNProject | null = null;
  options: HTMLVNScriptElementOptions = {
    indentSize: 2,
    debugLevel: 0,
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (!this.shadowRoot) {
      throw new Error("Could not attach shadow root to VNScriptElement.");
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
        }
      </style>
      <slot></slot>
    `;
  }

  connectedCallback() {
    const targetSceneDiv = this.getAttribute("in");
    const src = this.getAttribute("src");

    if (!targetSceneDiv) {
      console.error("VNScriptElement must have an 'in' attribute.");
      return;
    }

    const sceneContainerDiv = document.getElementById(targetSceneDiv);

    // don't pass this around as an argument, let's just access it as a property later
    this.targetSceneContainerDiv = sceneContainerDiv;

    const notifContainerTarget = this.getAttribute("notifications");

    if (notifContainerTarget != null) {
      const notificationContainer = document.querySelector(notifContainerTarget);
    }


    if (!sceneContainerDiv) {
      console.error(`Could not find element with id '${targetSceneDiv}'.`);
      return;
    }

    if (src) {
      this.load(src);
    } else {
      this.parse({ text: this.textContent as string });
    }
  }

  load(script: string) {
    fetch(script)
      .then((response) => response.text())
      .then((text) => {
        this.parse({ text });
      })
      .catch((error) => {
        console.error(`Could not load script '${script}':\n\n`, error);
      });
  }

  private stringMap: ParserStringMap = {
    count: 0,
  };

  /**
   * @param {string} text
   * @param {HTMLElement} sceneContainerDiv
   */
  private parse({ text }: { text: string }) {
    const lines = this.preprocess(text);
    const root = this.buildContext({
      name: "global",
      parent: null,
      lines,
      baseIndentLevel: 0,
      y1: 0,
      args: [], // maybe we'll add arguments to the root context later when run in a terminal or something
    });

    log("RESULT:", root);
  }

  /**
   * Reads until the end of an expression or statement then evaluates the value.
   * @param {string} value
   * @returns {VNValue | VNContext | undefined}
   */
  private evaluateValue({
    value,
    line,
  }: {
    value: string;
    line: PreprocessedLine;
  }): VNValue | VNContext | undefined {
    const { line: text, y, t } = line;

    let val = value.trim();

    // `value` contains only the value of the assignment, not the identifier or the assignment operator
    // also, values are case-insensitive as to not confuse users that may not be familiar with conventional programming languages

    if (value.toLowerCase() === "null") {
      return null;
    }

    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }

    // fallback to a string if no other type is detected
    return value;
  }

  private assignment({
    ctx,
    key,
    value,
  }: {
    ctx: VNContext;
    key: string;
    value: VNValue | undefined;
  }) {
    // check if the key is already defined in the current context
    const resolved = ctx.resolve(key);

    if (resolved != null) {
      // we do not own this variable, so keep a reference to it.
      // inner scopes cannot have their own variables with the same name as an outer scope
      // usually, languages will allow this, but it is a common source of bugs and confusion
      // so we'll just force the user to use a different name.

      // assign the value to the variable in the outer scope
      resolved.owner.children[resolved.key] = value;
      return;
    }

    ctx.set(key, value);
  }

  

  /**
   * Recursively build the context tree from the preprocessed lines.
   * @param {VNContext} parent Owner of the context. If null, the context is the root.
   * @param {Array<PreprocessedLine>} lines Preprocessed lines to build the context from.
   * @param {number} baseIndentLevel The base indent level of the context.
   * @param {number} y The current line number from where we left off in the parent context.
   * @returns {VNContext}
   */
  private buildContext({
    name,
    parent,
    lines,
    baseIndentLevel = 0,
    y1 = 0,
    y2 = 0,
    args = [],
  }: {
    name: string;
    parent: VNContext | null;
    lines: Array<PreprocessedLine>;
    baseIndentLevel?: number;
    y1?: number;
    y2?: number;
    args?: VNFunctionArgument[];
  }): VNContext {
    // due to the parent-child structure of a context node, we don't need a stack array to keep track of nesting
    let ctx = new VNContext({ parent, project: this.currentProject, name: name, args });

    const parseContextLines = ({ y1, preprocessedLines }: { y1: number, preprocessedLines: PreprocessedLine[] }): { scopedLines: PreprocessedLine[], returnStatement: string, y1: number, y2: number } => {

      let y2 = y1; // automatically set to y0 in case there are no lines in the context

      let result = false;
      let returnStatement: string = "";

      const scopedLines: PreprocessedLine[] = [];
      const allPreprocessedLines = preprocessedLines;

      for (let i = y1; i < lines.length; i++) {
        const line = allPreprocessedLines[i];

        scopedLines.push(line);

        const { t, y, line: text } = line;
        const { result: res, returnStatement: ret } = this.isEndOfContext(line, baseIndentLevel);

        result = res;
        returnStatement = ret;

        if (result) {
          // no need to parse any more lines.
          y2 = y;
          break;
        }
      }

      return { scopedLines, returnStatement: returnStatement, y1, y2 };
    }

    // we need to know exactly where the context begins and ends.
    const { scopedLines, returnStatement, y1: newY1, y2: newY2 } = parseContextLines({ y1, preprocessedLines: lines });

    for (let line of scopedLines) {
      const y = line.y;
      const t = line.t;
      const text = line.line;

      let relativeIndent = t - baseIndentLevel;

      // first, let's find all local identifiers so we can declare them ahead of time
      // variables cannot be declared without an assignment in the same statement
      const identifierRegex = /\$[a-zA-Z_0-9]+/g;

      const identifiers = text.match(identifierRegex);

      if (identifiers != null) {
        for (let identifier of identifiers) {
          this.assignment({ ctx, key: identifier, value: undefined });
        }
      }

      const tLessThanZero = () => {
        // less than zero relative indentation means that the current line belongs to the parent context
        // but only if the line is not empty

        if (text.trim() !== "") {
          y2 = y;
        }

        return;
      }

      const t0 = ({ isRoot = false }) => {

        // do the same thing as idt 1, but for the root context
        if (parent === null) {
          baseIndentLevel = 0;
          relativeIndent = 0;
          t1({ isRoot: true });
        }

        // if we got here, it means that the current context has a parent.
        // let's return to the parent context.
        if (isRoot) {
          return;
        }
      }

      const t1 = ({ isRoot = false }) => {
        // '=> name': function declaration
        // '=> name(arg1=val1, arg2=val2)': function declaration with arguments and default values. may have a space between the '=>' and the function name.
        if (text.startsWith("=>")) {
          const re = /=>\s*(\w+)\s*(?:\(([^)]+)\))?/;
          const match = text.match(re);
          const functionName = String(match ? match[1] : "").trim();

          log('Function name', functionName);

          // anonymous functions are not allowed
          if (!match || !functionName) {
            error({
              friendly: `Error: Functions (=>) must be followed by a name.`,
              detailed: `Syntax error: Invalid function declaration.`,
              lineNumber: y + 1,
            });
          }

          let args: VNFunctionArgument[] = [];

          if (match && match[2]) {
            args = match[2]
              ? match[2].split(",").map((arg) => {
                if (arg.includes("=")) {
                  const [key, value] = arg.split("=");
                  return { key: key.trim(), value: value.trim() };
                } else {
                  return { key: arg.trim(), value: undefined };
                }
              })
              : [];

            log("Arguments", args);
          }

          const startLine = y;

          // enter the function's context
          // we need to modify the lines array so that the function's context only has access to the lines that belong to it
          const functionContext = this.buildContext({
            name: functionName,
            parent: ctx,
            lines,
            baseIndentLevel: baseIndentLevel + 1,
            y1: y,
            args: args,
          });

          // store a reference to this local function in the parent (this) context
          ctx.set(functionName, functionContext);

          return;
        }

        // '<=': return statement
        if (text.startsWith("<-")) {
          const re = /<-\s*(.+)/;
          const match = text.match(re);
          let returnValue = match ? match[1] : null;

          if (!returnValue) {
            returnValue = null;
          }


        }
      }

      const t2 = () => {

      }


      const t3 = () => {

      }

      const tDefault = () => {
        if (relativeIndent > 3) {
          // at no point should the relative indentation level be greater than 3 in any context
          error({
            friendly: `Error: Invalid indentation level.`,
            lineNumber: y,
            detailed: `Syntax error: Invalid indentation level at line ${y + 1}.`,
          });
        } else if (relativeIndent < 0) {
          if (text.trim() !== "") {
            tLessThanZero();
          }

        }
      }

      // though variable assignments and other statements can be at any indentation level within a function,
      // certain indentation levels have special semantic meaning in vnscript
      // 0: parent context. if the parent is null, this is the root context. if not, we should return to the parent context.
      // 1: local function declarations
      // 2: actor focus or narration
      // 3: actor dialogue
      switch (relativeIndent) {
        case 0:
          t0({ isRoot: parent === null });
          break;

        case 1:
          t1({ isRoot: parent === null });
          break;
        case 2:
          t2();
          break;

        case 3:
          t3();
          break;

        default:
          tDefault();
          break;
      }

      // catch-all for any logic that should be executed at any indentation level
      // this includes variable assignments, function calls, and other statements

      // must not be followed by a `>` character because that is reserved for function declarations
      const equalsSigns = text.match(/=[^>]/g);

      // single variable assignment
      if (equalsSigns != null && equalsSigns.length === 1) {
        const [key, value] = text.split("=");
        if (value.trim() === "") {
          error({
            friendly: `Error: A value such as text, number, etc. is required when setting a variable!`,
            lineNumber: y,
            detailed: `Syntax error: Invalid variable assignment at line ${y + 1}.`,
          });
        }

        // valid variable assignment
        const parsedValueText = this.parseValueFollowingEqualsSign({ valueStart: value, line });
      }
      // function call
    }

    return ctx;
  }

  /**
   * Patterns for deciding when an expression ends.
   */
  private endOfExpressionDelims = [
    // Double empty lines
    /\n\s*\n\s*\n/g,
    // commas appearing outside of a string
    /(?<!"[^"]*),/g,
  ]

  private endOfContextDelims = [
    // return statement with a value (optional)
    /^\s*<=\s*(.+)*$/g,
  ]

  private isEndOfContext(line: PreprocessedLine, baseIndentLevel: number): { result: boolean, returnStatement: string } {
    const { line: text, t, y } = line;
    const relativeIndent = t - baseIndentLevel;

    if (y >= line.allLines.length) {
      return { result: true, returnStatement: "" };
    }

    if (relativeIndent < 0 && text.trim() !== "") {
      return { result: true, returnStatement: "" };
    }

    // check return statement
    const returnStatement = text.match(this.endOfContextDelims[0]);
    if (returnStatement != null) {
      return { result: true, returnStatement: returnStatement[1] };
    }

    return { result: false, returnStatement: "" };
  }

  private parseValueFollowingEqualsSign({
    valueStart,
    line,
  }: {
    valueStart: string;
    line: PreprocessedLine;
  }) {
    const { line: text, y, t } = line;
    let result = text;

    // we're going to parse until a statement is found, the expression ends

  }

  private preprocess(text: string): PreprocessedLine[] {
    let processed = text;

    // remove all text between '#' and '\n', but not if it is inside a string
    const matchComments = /(?<!"[^"]*)#.*\n/g;

    processed = processed.replace(matchComments, "");

    // empty lines preceded by an empty line are removed. only one empty line should appear in a row
    const matchEmptyLines = /\n\s*\n\s*\n/g;

    processed = processed.replace(matchEmptyLines, "\n\n");

    // remove all leading and trailing whitespace
    const matchWhitespace = /^\s+|\s+$/g;

    processed = processed.replace(matchWhitespace, "");
    console.log(processed);

    const preprocessedInfo = {
      lines: [] as PreprocessedLine[],
      lineCount: processed.split("\n").length,
    };

    // attach relevant information to each line to help the parser
    const lines = processed.split("\n").map((line, y) => {
      const t = this.getIndentLevel({ line, y });
      const preprocessedLine = { line: line.trim(), y, t, allLines: preprocessedInfo.lines };
      preprocessedInfo.lines.push(preprocessedLine);
      return { line: line.trim(), y, t, allLines: preprocessedInfo.lines };
    });

    // find all explicit string literals and store them in a map
    const explicitStringMap: ParserStringMap = {
      count: 0
    };

    let startQuoteX = -1;
    let endQuoteX = -1;
    let value = "";

    // find all string pairs
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y].line;

      function resetValues() {
        startQuoteX = -1;
        endQuoteX = -1;
        value = "";
      }

      for (let x = 0; x < line.length; x++) {
        let char = line[x];

        if (char === '"') {
          if (startQuoteX === -1) {
            startQuoteX = x;
          } else {
            endQuoteX = x;
            value = line.slice(startQuoteX + 1, endQuoteX);
            explicitStringMap[y] = { start: startQuoteX, end: endQuoteX, value };
            explicitStringMap.count++;
            resetValues();
          }
        }
      }

      // resetValues(); // let's allow explicit strings to span multiple lines
    }

    /**
     *
     *    ------------------------------------------------------------------------------------------------------------
     *  /    WARNING: PAST THIS POINT, NO MODIFICATION OF THE CONTENTS OF THE TEXT INSIDE EACH LINE SHOULD OCCUR.      \
     *  \           THIS IS BECAUSE WE HAVE ASSIGNED START AND END INDICES TO EACH STRING IN THE TEXT.                 /
     *    ------------------------------------------------------------------------------------------------------------
     * 
     */

    // assign the string map to this instance for later use
    this.stringMap = explicitStringMap;
    console.log(explicitStringMap);
    console.log(lines);
    return lines;
  }

  private getIndentLevel({ line, y }: { line: string; y: number }) {
    const indentSize = this.options.indentSize;
    let indentLevel = 0;

    for (let i = 0; i < line.length; i++) {
      if (line[i] === " ") {
        indentLevel++;
      } else {
        break;
      }
    }

    if (indentLevel % indentSize !== 0) {
      throw new Error(
        `Syntax error: Invalid indentation level at line ${y + 1}.`
      );
    }

    return indentLevel / indentSize;
  }

  private resetParserState() {
    this.stringMap = { count: 0 };
  }
}