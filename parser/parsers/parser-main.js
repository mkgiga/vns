import { Parser, ParserResult } from "../parser.js";

import { JSParser } from "./parser-js.js";

/**
 * @class VNEngineParser
 * @description Main parser for the VN engine scripting language.
 * It takes care of parsing one function's body. The main script is just a function with the name 'global'.
 * Thus, when the parser encounters a function declaration, it creates a new context object and parses the body of the function
 * by creating a new instance of itself. Any other syntax inbetween is parsed by a set of child parsers.
 */
export class VNEngineParser extends Parser {
  constructor({
    text = "",
    ctx = null,
    parentParser = null,
    y = 0,
    x = 0,
    t = 0,
  }) {
    super({ text, ctx, parentParser, y, x, t });
  }

  state = {
    buffer: "",
    stack: [],
    t: 0,
    x: 0,
    y: 0,

    /*
     * vns is kind of like a querying language, where you
     * select an object, then operate on it with commands
     * this holds the object that was selected
     */
    selected: undefined,
  };

  parse() {
    console.log("[Preprocessing] Preprocessing text...");

    let text = preprocess(this.text);

    const ctx = this.ctx;
    const stack = [ctx];

    let baseDepth = this.baseDepth;
    let t = 0;
    let x = 0;
    let y = 0;

    const jsArray = [];

    this.lines = text.split("\n");

    while (y < this.lines.length) {

      const rawLine = this.lines[y];

      t = this.getDepth(rawLine, y);
      x = t * 2;
      
      let line = rawLine.slice(x);

      

      
      // syntax which is valid regardless of relative depth

      if (line.trim().startsWith("```")) {
        
        const parsed = new JSParser({
          lines: this.lines,
          ctx,
          parentParser: this,
          t: t,
          y: y,
          x: x,
        }).parse();

        const js = parsed.value;

        ctx.body.push(
          this.instruction({
            name: "engine.js",
            params: {
              code: js,
            },
          })
        );

        jsArray.push(js);

        x = parsed.x;
        y = parsed.y;

        console.log(`[JSParser] Parsed JS block at ${y}`);

        continue;
      }

      const createSpecificMatch = line.trim().match(/^create (\w+) (\w+)\s*$/);

      if (createSpecificMatch) {
        const type = createSpecificMatch[1];
        const id = createSpecificMatch[2];

        if (type !== "actor" && type !== "place") {
          return new ParserResult({
            error: {
              friendly: `Error: Only actors and places can be created. Create "${type}" is not valid.`,
              nerd: `Invalid syntax: ${type} is not a valid type for the create command.`,
            },
          });
        }

        ctx.body.push(
          this.instruction({
            name: `engine.create.${type}`,
            params: {
              id: id,
            },
          })
        );

        y++;
        x = 0;

        continue;
      }

      /**
       * optionally, you can use commas to select multiple objects
       * 'select a, b, c, ...' ( whitespace is not needed between commas )
       * or you can select one object with 'select a'
       */
      const selectDynamicMatch = line
        .trim()
        .match(/^select (\w+(?:,\s*\w+)*)\s*$/);


      if (selectDynamicMatch) {
        const ids = selectDynamicMatch.slice(1).filter(Boolean);

        ctx.body.push(
          this.instruction({
            name: "engine.select",
            params: {
              ids: [...ids],
            },
          })
        );

        y++;
        x = 0;

        continue;
      }

      const selectSpecificMatch = line.trim().match(/^select (\w+) (\w+)\s*$/);

      if (selectSpecificMatch) {
        if (
          selectSpecificMatch[1] !== "actor" &&
          selectSpecificMatch[1] !== "place"
        ) {
          return new ParserResult({
            error: {
              friendly: `Error: Only actors and places can be selected. Select "${selectSpecificMatch[1]}" is not valid.`,
              nerd: `Invalid syntax: ${selectSpecificMatch[1]} is not a valid target type for the select command.`,
            },
          });
        }

        const target = selectSpecificMatch[1];
        const id = selectSpecificMatch[2];

        ctx.body.push(
          this.instruction({
            name: `engine.select.${target}`,
            params: {
              id: id,
            },
          })
        );

        y++;
        x = 0;

        continue;
      }

      
      const parameterlessFunctionLabelMatch = line.trim().match(/^@\s*(\w+)\s*$/);

      if (parameterlessFunctionLabelMatch) {
        const functionName = parameterlessFunctionLabelMatch[1];

        const newFunction = this.create.context({
          // path as an array of strings for fast lookup
          parent: stack.reduce((acc, ctx) => {
            return [...acc, ctx.name];
          }, []),
          name: functionName,
          parameters: [],
          body: [],
          value: undefined,
          variables: {},
          condition: "true",
          options: {},
          depth: t,
        });

        // parse the body of the function the same way we parse the main script,
        // because the main script is just a function itself implicitly named 'global'
        newFunction.body = new VNEngineParser({
          lines: this.lines,
          ctx: newFunction,
          parentParser: this,
          y: y,
          x: x,
          t: t
        });

        const res = this.create.instruction({
          name: `engine.context.declare.fn`,
          params: newFunction,
        });

        y++;
        x = 0;

        continue
      }
      
      /**
       * optionally, functions may have arguments placed inside parentheses
       */
      const parameterFunctionLabelMatch = line.trim().match(/^@(\w+)\s*\((.*)\)\s*$/);

      // syntax which has depth-specific meaning,
      // also whenever no other syntax matches,
      // we can fall back to assuming it's a dialogue line, narration or actor change
      switch(t - baseDepth) {
        case 0: // going back to the previous context's depth means we are done with the current context
          if (stack.length === 1) {
            // we are at the root context, there is nothing to pop. do nothing.
            y++;
            x = 0;
            continue;
          }
          
          console.log("Done parsing context");
          console.log(ctx);
          debugger;
          
          return new ParserResult({
            value: ctx,
            x: x,
            y: y,
          });
        case 1: // setting current speaker, narration
          const patternActorMatch = line.trim().match(/^([\w\s]+)$/);
          if (patternActorMatch) {
            const value = patternActorMatch[1];

            ctx.body.push(
              this.instruction({
                name: "engine.dialogue.narrationoractor",
                params: {
                  value: value,
                },
              })
            );

            x = 0;
            y++;

            continue;  
          }
          break;

        case 2: // character dialogue
          break;
      }


      y++;
    }

    return new ParserResult({
      value: {
        context: ctx,
        js: jsArray,
      },
      x: null,
      y: null,
    });
  }
}

/**
 * Preprocesses the text before parsing,
 * removing any comments, and other unnecessary text.
 * @param {string} text
 */
function preprocess(text) {
  // 1. normalize newlines
  text = text.replace("\r\n", "\n");

  // 2. save blocks of javascript
  const js = /(```[\s\S]*?```)/g;
  const jsBlocks = text.match(js);

  text = text.replace(js, "");

  // 3. remove comments, trailing whitespace, and more than 2 newlines
  const patterns = [
    [/(##.*)$/gm, "\n"] /* bye comments              */,
    [/(\s*(\n|\r\n|\r)){3,}/g, "\n\n"] /* bye more than 2 newlines  */,
    [/(\s+)$/g, ""] /* bye trailing whitespace   */,
  ];

  let previousCharCount = text.length;

  for (let [pattern, replacement] of patterns) {
    text = text.replace(pattern, replacement);

    const charCount = text.length;
    console.log(
      `[Preprocessing] Replaced ${
        previousCharCount - charCount
      } characters applying pattern ${pattern}`
    );
  }

  // normalize newlines again
  text = text.replace("\r\n", "\n");

  // 4. merge js blocks back into the text
  if (jsBlocks) {
    text += "\n\n" + jsBlocks.join("\n\n");
  }

  return text;
}

export default VNEngineParser;
