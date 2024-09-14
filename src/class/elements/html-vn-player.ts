export class HTMLVNPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // TODO: figure out how shadowRoot can be null and how to handle it.
    if (this.shadowRoot === null) {
      throw new Error("Shadow root failed to initialize.");
    }

    // make the element scale with its parent container
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* default values */
          --dialogue-font: sans-serif;
          --dialogue-text-color: #000;
          --narrator-text-color: #333;
          --background-color: #fff;
          --text-speed: 60ms;
          --text-box-background-color: #000;
          
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: sans-serif;

          text-box {
            font-family: var(--dialogue-text-font);
            color: var(--dialogue-text-color);

            top: 80%;
            left: 10%;
            right: 10%;
            bottom: 10%;
            position: absolute;

            background-color: var(--text-box-background-color);
            padding: 1rem;
          }

          .vn-layer {
            .vn-background, .vn-forground {
              z-index: 0;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              aspect-ratio: 16 / 9;
            }
            
        }
      </style>
      
      <div class="vn-scene">
        <div class="vn-layer vn-background"></div>
        <div class="vn-layer vn-actors"></div>
        <div class="vn-layer vn-foreground"></div>
      </div>
    `;
  }

  public loadScript(script: string) {

  }

  private run({ script }: { script: string }) {

  } 

  public connectedCallback() {
  
  }

  public disconnectedCallback() {
  
  }

  public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'music':
        break;
      case 'text-color':
        break;
      case 'background-color':
        break;
      case 'dialogue-font':
        break;
      case 'text-speed':
        break;
      case 'no-scroll':
        break;
    }
  }

  public static get observedAttributes() {
    // default attributes for behavior
    return ['music', 'text-color', 'background-color', 'dialogue-font', 'text-speed', 'no-scroll'];
  }
}