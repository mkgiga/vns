import { VNValue, VNFunctionArgument, PreprocessedLine, } from "../types"; 
import { HTMLVNScriptElement } from "./elements/html-vn-script-element";
import { VNInstruction } from "./vn-instruction"; 
import { VNProject } from "./vn-project";

/**
 * An object which may have named children or a parent (unless it is the root, in which the parent is null).
 * @class
 * @property {VNContext | null} parent The parent context of this context. If null, this is the root context.
 * @property {VNValue | VNContext} children The children of this context. May be a VNValue or another VNContext.
 * @property {VNProject | null} project The project that this context belongs to.
 */
export class VNContext {

  name: string;
  parent: VNContext | null;
  children: { [key: string]: VNValue | VNContext };
  parser: HTMLVNScriptElement;
  project: VNProject;
  args: VNValue[];
  scopedLines: PreprocessedLine[];

  /**
   * An unevaluated return statement string which gets evaluated when the context is exited.
   */
  returnStatement: string;

  // statements that are executed in order
  instructions: VNInstruction[];

  constructor({
    name,
    parent,
    project,
    children = undefined,
    args = [],
    instructions = [],
    returnStatement = "",
    parser,
    scopedLines,
  }: {
    name: string;
    parent: VNContext | null;
    project: VNProject;
    children?: { [key: string]: VNValue | VNContext };
    args?: VNValue[];
    instructions?: VNInstruction[];
    returnStatement?: string;
    parser: HTMLVNScriptElement;
    scopedLines: PreprocessedLine[];
  }) {
    this.name = name;
    this.parent = parent;
    this.project = project;
    this.children = children || {};
    this.args = args;
    this.instructions = instructions;
    this.returnStatement = returnStatement;
    this.parser = parser;
    this.scopedLines = scopedLines;
  }

  /**
   * Attempt to find an object in the current context or one of its ancestors.
   * @param {string} identifier The identifier to search for.
   * @returns {VNValue | null} The value of the identifier if found, or null if not found.
   */
  resolve(
    identifier: string
  ): { key: string; value: VNValue; owner: VNContext } | undefined {
    if (this.children[identifier]) {
      return {
        key: identifier,
        value: this.children[identifier],
        owner: this,
      };
    } else if (this.parent) {
      return this.parent.resolve(identifier);
    }

    // explicitly return undefined if the identifier is not found in the current context or any of its ancestors
    // we do this because null is a valid value in vnscript
    return undefined;
  }

  /**
   * A pretty-printed version of the context object without needless clutter.
   * @returns {object} A pretty-printed version of the context object used for printing to the console.
   */
  public prettyPrintedObject(): { [key: string]: VNValue | VNContext } {
    const pretty = {
      ...(() => {
        let children: { [key: string]: VNValue | VNContext } = {};

        for (let key in this.children) {
          const value = this.children[key];
          if (value instanceof VNContext) {
            children[key] = value.prettyPrintedObject();
          } else {
            children[key] = value;
          }
        }
        return children;
      })(),
    };

    return pretty;
  }

  onReturn() {
    const statement = this.returnStatement;
    return this.parser.evaluate(statement, this.scopedLines);
  }

  /**
   * Get the value of an identifier in the current context or one of its ancestors (if found).
   * @param {string} identifier The identifier to get the value of.
   * @returns {VNValue | null} The value of the identifier if found, or null if not found.
   */
  get(identifier: string): VNValue | null {
    let resolved = this.resolve(identifier);
    return resolved ? resolved.value : null;
  }

  /**
   * Set the value of an identifier in the current context or one of its ancestors (if found).
   * @param {string} identifier The identifier to set the value of.
   * @param {VNValue} value The value to set the identifier to
   * @returns {void}
   */
  set(identifier: string, value: VNValue) {
    let resolved = this.resolve(identifier);

    // if the identifier is not found within any of its ancestors -- set it in the current context
    if (resolved) {
      resolved.owner.children[resolved.key] = value;
    } else {
      this.children[identifier] = value;
    }
  }

  setArgs(args: VNFunctionArgument[]) {
    this.args = args.map((arg) => arg.value);
  }
}

export default { VNContext };