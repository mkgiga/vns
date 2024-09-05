/**
 * @file vns.ts
 * @description An unintimidating visual novel scripting engine and player with rich, 
 * beautiful movie script-like syntax that is easy to learn for beginners and experts alike.
 * @version 0.2.0
 * @license MIT
 * @author mkgiga
 */

import { HTMLVNScriptElement } from "@elements/html-vn-script-element";
import { HTMLVNParserDebugConsole } from "./class/elements/html-vn-parser-debug-console";
import { GlobalState } from "@classes/vn-global-state";

function init() {
  GlobalState.init();
}

customElements.define("vn-script", HTMLVNScriptElement);
customElements.define("vn-parser-debug-console", HTMLVNParserDebugConsole);




init();