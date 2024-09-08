import { HTMLVNParserDebugConsole } from "@elements/html-vn-parser-debug-console";

export class GlobalState {

  /**
   * Colors for notifications among other things.
   */
  static Colors = class Colors {
    static info = "#3498db"
    static bad = "#e74c3c"
    static good = "#2ecc71"
    static warn = "#f39c12"
  };

  /**
   * Optional singleton class for flags which may or may not be desired in the final build. 
   */  
  static Flags = class Flags {
    static INJECT_CSS = true;
  };
  
  static notificationsContainer: HTMLDivElement | null = null;
  static debugConsole: HTMLVNParserDebugConsole | null = null;
  
  static init() {
    document.addEventListener("DOMContentLoaded", () => {
      GlobalState.injectNotificationsContainer();
    });

    if (GlobalState.Flags.INJECT_CSS) {
      GlobalState.injectCss();
    }
  }

  static injectCss() {
    const fontFace = document.createElement("style");
    fontFace.innerHTML = `@font-face {
        font-family: 'Nunito';
        font-style: normal;
        font-weight: 300;

        /* ask daddy google for a font */
        src: url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;700&display=swap') format('woff2');
      }`;
    document.head.appendChild(fontFace);
  }

  static injectNotificationsContainer() {
    const notifContainerHtml = `<div id="vn-notifications-container" style="position: fixed; bottom: 0; right: 0; z-index: 9999; width: 25vw; max-height: 100vh; overflow-y: auto; padding: 1rem;"></div>`;
    const notifContainer = document.createElement("div");
    notifContainer.innerHTML = notifContainerHtml;
    document.body.appendChild(notifContainer);
  }
}