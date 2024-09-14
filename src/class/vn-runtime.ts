/**
 * @file vn-runtime.ts
 * @fileoverview This file contains the runtime environment for executing visual novel scripts.
 * @module vns
 * @license MIT
 * @author mkgiga
 */

import { VNContext } from './vn-context';
import { VNInstruction } from './vn-instruction';

/**
 * A runtime environment for executing visual novel scripts.
 */
export class VNRuntime {
  root: VNContext;
  currentContext: VNContext;

  /** The 'cursor' position in the list of executable statements. */
  i: number = 0;

  constructor({ root }: { root: VNContext }) {
    this.root = root;
    this.currentContext = root;
  }

  onEnterContext(ctx: VNContext) {
    this.i = 0;
    this.currentContext = ctx;
  }

  executeCurrent() {
    const ctx = this.currentContext;
    const instructions = ctx.instructions;
    const current = instructions[this.i];
    const fn = current.callback;

    fn(ctx, current.args);

    this.i++;
  }

  run() {
    let ctx = this.currentContext;
    let i = this.i;

    while (ctx.parent != null) {
      while (i + 1 < ctx.instructions.length) {
        this.executeCurrent();
      }
    }
  }
}

