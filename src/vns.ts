/**
 * @file vns.ts
 * @description An unintimidating visual novel scripting engine and player with rich, 
 * beautiful movie script-like syntax that is easy to learn for beginners and experts alike.
 * This file, once built with rollup, should be included in the <head> section of an HTML document.
 * It immediately defines the custom elements that you use in your page.
 * @license MIT
 * @author mkgiga
 * @module vns
 */

import { HTMLVNScriptElement } from "@elements/html-vn-script-element";
import { HTMLVNParserDebugConsole } from "./class/elements/html-vn-parser-debug-console";
import { GlobalState } from "@classes/vn-global-state";

function init() {
  // Initializes a global state object accessible through `document.window`
  // Also injects CSS styles for the parser's utility elements like the debug console
  GlobalState.init();
}

customElements.define("vn-script", HTMLVNScriptElement);
customElements.define("vn-parser-debug-console", HTMLVNParserDebugConsole);


init();