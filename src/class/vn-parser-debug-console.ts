export class HTMLParserDebugConsole extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    if (!this.shadowRoot) {
      throw new Error('Shadow DOM not supported, until this has been fixed, upgrade your browser to the latest version.');
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-rows: 1fr 8fr 1fr;
          padding: 10px;

          /* very dark grey */
          background-color: #202020;
          
          color: #f0f0f0;
          font-family: 'Courier New', Courier, monospace;
          margin: 0.225rem;
        }
      </style>
      <div class="title-bar"><p><slot name="title">Deb ugConsole</slot></p></div>
      <div class="content"><slot></slot></div>
      <div class="footer"><p><slot name="footer"></slot></p></div>
    `;
  }

  connectedCallback() {
    console.log('Connected to the DOM');
  }

  put(str: string) {

  }
}

customElements.define('debug-console', HTMLParserDebugConsole);

export default { HTMLParserDebugConsole };