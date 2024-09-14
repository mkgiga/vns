import { VNContext } from "@/classes/vn-context";
import { VNProject } from "@/classes/vn-project"
import { error, log } from "@/util/debug";

console.log("Hello, world!");

import {
  VNValue,
  HTMLVNScriptElementOptions,
  PreprocessedLine,
  VNFunctionArgument,
  ParserStringMap,
} from "../../types";

export class HTMLVNScriptElement extends HTMLElement {

  targetSceneContainerDiv: HTMLElement | null = null;

  currentProject: VNProject = new VNProject({
    name: "Untitled",
    version: "1.0",
    description: "An untitled visual novel project.",
    authors: ['Anonymous'],
    credits: "",
    license: "",
    mainScene: "",
    actors: {},
    signals: {},
    sounds: {},
    places: {},
    scripts: {},
  });

  options: HTMLVNScriptElementOptions = {
    indentSize: 2,
    debugLevel: 0,
  };

  /**
   * At runtime, this is set to be a reference to all the lines that are being parsed relative to the root context.
   */
  lines: PreprocessedLine[] = [];

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
    console.log("Parsing text...");
    const lines = this.preprocess(text);
    
    const y = 0;
    
    this.lines = lines;
    let root: VNContext;

    /**
     * Recursively build the context tree from the preprocessed lines.
     * @param {VNContext} parent Owner of the context. If null, the context is the root.
     * @param {Array<PreprocessedLine>} lines Preprocessed lines to build the context from.
     * @param {number} baseIndentLevel The base indent level of the context.
     * @param {number} y The current line number from where we left off in the parent context.
     * @returns {VNContext}
     */
    const buildContext = ({
      name,
      parent,
      lines,
      startY = 0,
      baseIndentLevel = 0,
      args = [],
      project,
    }: {
      name: string;
      parent: VNContext | null;
      lines: Array<PreprocessedLine>;
      baseIndentLevel?: number;
      startY: number;
      args?: VNFunctionArgument[];
      project: VNProject;
    }): VNContext => {
      
      let ctx = new VNContext({ name, parent, project, parser: this, scopedLines: lines });
      const { y, t, line: text } = lines[startY];

      const shouldReturn = (line: PreprocessedLine): boolean => {
        const { y, t, line: text } = line;

        if (t <= baseIndentLevel || y >= lines.length - 1) {
          return true;
        }

        if (t >= baseIndentLevel + 1) {
          // return statement
          if (text.startsWith('<=')) {
            return true;
          }
        }
        
        return false;
      };

      const shouldNest = (line: PreprocessedLine): boolean => {
        const { y, t, line: text } = line;

        if (t <= baseIndentLevel) {
          return false;
        }

        // function declaration. handle parsing of arguments when this function returns true
        if (text.startsWith('=>')) {
          return true;
        }

        return false;
      };

      for (let i = startY; i < lines.length; i++) {
        const line = lines[i];
        const { y, t, line: text } = line;

        if (shouldReturn(line)) {
          return ctx;
        }

        if (shouldNest(line)) {
          const nestedCtx = buildContext({
            name: text,
            parent: ctx,
            lines,
            baseIndentLevel: t,
            startY: i,
            args,
            project,
          });

          ctx.set(text, nestedCtx);
        }
      
      }

      
      return ctx;
    }
  }


  private preprocess(text: string): PreprocessedLine[] {
    let processed = text;

    // remove all comments (#)
    const matchComments = /#.*$/gm;

    processed = processed.replace(matchComments, "");

    // empty lines preceded by an empty line are removed. only one empty line should appear in a row
    const matchEmptyLines = /\n\s*\n\s*\n/g;

    processed = processed.replace(matchEmptyLines, "\n\n");

    // remove all whitespace from the beginning and end of the text
    const matchWhitespace = /^\s*|\s*$/g;

    processed = processed.replace(matchWhitespace, "");
    console.log(processed);

    const preprocessedInfo = {
      lines: [] as PreprocessedLine[],
      lineCount: processed.split("\n").length,
    };

    let previousIndentLevel = 0;

    /**
     * A special array where each line is attributed properties relevant to the parser. 
     * @type {Array<PreprocessedLine>} 
     */
    const lines: Array<PreprocessedLine> = processed.split("\n").map((line, y) => {
      const t = this.getIndentLevel({ line, y, previousIndentLevel });
      previousIndentLevel = t;

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
     * @important
     *    ------------------------------------------------------------------------------------------------------------
     *  /    WARNING: PAST THIS POINT, NO MODIFICATION OF THE CONTENTS OF THE TEXT INSIDE EACH LINE SHOULD OCCUR.      \
     *  \           THIS IS BECAUSE WE HAVE ASSIGNED START AND END INDICES TO EACH STRING IN THE TEXT.                 /
     *    ------------------------------------------------------------------------------------------------------------
     * 
     */

    // for keeping track of string literal indices
    this.stringMap = explicitStringMap;

    console.log(explicitStringMap);
    console.log(lines);

    return lines;
  }

  private getIndentLevel({ line, y, previousIndentLevel }: { line: string; y: number, previousIndentLevel: number }) {
    const indentSize = this.options.indentSize;
    let indentLevel = 0;

    for (let i = 0; i < line.length; i++) {
      let emptyLineRegex = /^\s*$/g;

      /* 
       * in order to avoid having to check for empty lines when
       * checking for end of context, we'll just ensure that empty lines
       * inherit the previous line's indentation level.
       * this should keep things simple and consistent later on.
       */
      if (emptyLineRegex.test(line)) {
        return previousIndentLevel;
      }

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

  public evaluate(expression: string, scopedLines: Array<PreprocessedLine>): VNValue | VNContext | undefined {
    let result: VNValue | VNContext | undefined = undefined;

    result = this.evaluateValue({ value: expression, line: { line: expression, y: 0, t: 0, allLines: [] } });

    // TODO: Implement the logic for evaluating an expression
    return result;
  }



  private resetParserState() {
    this.stringMap = { count: 0 };
  }
}