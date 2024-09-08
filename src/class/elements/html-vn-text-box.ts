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
          border-radius: 0.25rem;

          .vn-speakers {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0.5rem;
          }

          .vn-dialogue {
            padding: 0.5rem;
          }

          .vn-choices {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0.5rem;

            ul {
              list-style-type: none;
              list-style-position: inside;
              display: flex;
              flex-direction: column;
              padding: 0;
              gap: 0.25rem;

              li > ::slotted(*) {
                display: inline-block;
                padding: 0.25rem;
                border-radius: 0.25rem;
                background-color: #f0f0f0;
                cursor: pointer;
              }

              li:hover > ::slotted(*) {
                background-color: #e0e0e0;
              }

              li:active > ::slotted(*) {
                background-color: #d0d0d0;
              }
            }
          }

          .vn-footer {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0.5rem;
          }
        }
      </style>

      <div class="vn-speakers">
        <ol class="vn-speaker-list">
          <slot name="speakers"></slot>
        </ol>
      </div>
      <div class="vn-dialogue">
        <slot></slot>
      </div>
      <div class="vn-choices">
        <ul>
          <slot name="choices"></slot>
        </ul>
      </div>
      <div class="vn-footer">
        <slot name="footer"></slot>
      </div>
    `;
  }

  public setSpeakers({ speakers = [] }: { speakers: string[] }) {
    const speakerList = this.shadowRoot?.querySelector(".vn-speaker-list");

    if (speakerList === null || speakerList === undefined) {
      throw new Error("Speaker list not found.");
    }

    speakers.forEach(speaker => {
      const speakerItem = document.createElement("li");
      speakerItem.textContent = speaker;
      speakerList.appendChild(speakerItem);
    });

    return this;
  }

  public setText({ text = "" }: { text: string }) {
    const dialogue = this.shadowRoot?.querySelector(".vn-dialogue");

    if (dialogue === null || dialogue === undefined) {
      throw new Error("Dialogue element not found.");
    }

    dialogue.textContent = text;

    return this;
  }

  public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "speakers") {
      this.setSpeakers({ speakers: newValue.split(",") });
    } else if (name === "text") {
      this.setText({ text: newValue });
    }
  }

  public static get observedAttributes() {
    return ["speakers", "text"];
  }

  public connectedCallback() {
    console.log("textbox connected");
  }

  public disconnectedCallback() {
    console.log("textbox disconnected");
  }
}