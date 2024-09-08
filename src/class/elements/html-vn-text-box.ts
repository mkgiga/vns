export class HTMLVNTextBox extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    if (this.shadowRoot === null) {
      throw new Error("Shadow root failed to initialize.");
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: sans-serif;
        }
      </style>
    `;
  }

  connectedCallback() {
    console.log("textbox connected");
  }

  disconnectedCallback() {
    console.log("textbox disconnected");
  }
}