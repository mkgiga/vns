export class HTMLVNParserDebugConsole extends HTMLElement {
  static console: HTMLDivElement | null = null;
  
  input: HTMLInputElement | null = null;
  content: HTMLDivElement | null = null;
  titleContainer: HTMLDivElement | null = null;

  constructor() {
    super();
    
    this.attachShadow({ mode: "open" });
    this.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          position: fixed;
          bottom: 0;
          right: 0;
          z-index: 10000;
          background-color: #2c3e50;
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
        }

        p {
          margin: 0;
          padding: 0;
        }

        p.console-message {
          font-family: 'Nunito', sans-serif;
        }

        p.console-message.info {
          color: #3498db;
        }

        p.console-message.bad {
          color: #e74c3c;
        }

        p.console-message.good {
          color: #2ecc71;
        }

        p.console-message.warn {
          color: #f39c12;
        }
        
      </style>

      <div class="vn-parser-debug-console">
        <div class="console-title">
          <p>Parser Debug Console</p>
        </div>

        <div class="console-messages">
          <slot></slot>
        </div>

        <div class="console-input-footer">
          <input type="text" placeholder="Enter a command..." />
        </div>
      </div>
    `;
  }

  connectedCallback() {
    this.input = this.shadowRoot?.querySelector("input") as HTMLInputElement;
    this.content = this.shadowRoot?.querySelector(".console-messages") as HTMLDivElement;
    this.titleContainer = this.shadowRoot?.querySelector(".console-title") as HTMLDivElement;
  }
}

export default { HTMLVNParserDebugConsole };