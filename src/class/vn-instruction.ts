import { VNValue } from "../types";
import { VNContext } from "./vn-context";

export abstract class VNInstruction {

  /**
   * The name of the instruction.
   * @returns The name of the instruction.
   * @throws {Error} Throws an error if the 'getName' method is not implemented.
   */
  static getName() {
    throw new Error("Please specify a name for this instruction by overriding the 'getName' method.");
  }
  
  /**
   * Alias for the 'getName' method.
   * @returns  The name of the instruction.
   * @throws {Error} Throws an error if the 'getName' method is not implemented.
   */
  static name() {
    return this.getName();
  }

  /**
   * The parent context that this instruction belongs to.
   */
  caller: VNContext;
  callback: (ctx: VNContext, args: VNValue[]) => void;
  args: VNValue[] = [];

  constructor({
    callback = (ctx: VNContext, args: VNValue[]) => {
      throw new Error("Please implement a handler for this instruction.");
    },
    args,
    caller,
  }: {
    callback: (ctx: VNContext, args: VNValue[]) => void;
    args: VNValue[];
    caller: VNContext;
  }) {
    this.callback = callback;
    this.args = args;
    this.caller = caller;
  }
}