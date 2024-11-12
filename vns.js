/**
 * @namespace VNEngine
 * @fileoverview vns.js - Visual Novel Engine
 * 
 * A simple visual novel engine for creating interactive experiences which aims to be easy for anyone to use.
 * As for the scripting language, I am prioritizing making writing scripts as painless as possible,
 * that means no having to repeat the name of the actor, and a lot of shorthands for common actions.
 * Because this is written in JavaScript, I am allowing JavaScript to be referenced and executed in the scripts
 * so that you can have more control over the experience, and integrate with other web technologies.
 *
 * @version 0.1.0
 * @license MIT
 * @author mkgiga
 */

import html from "./lib/html.js";
import VNEngineParser from "./parser/parsers/parser-main.js";

/**
 * @typedef VNActor
 * @property {string} name The name of the actor
 * @property {string} id The unique identifier of the actor
 * @property {string} description A description of the actor
 * @property {{ 
 *   color: string, 
 *   font: string, 
 *   size: string, 
 *   style: string 
 * }} text The text style of the actor
 * @property {{ [key: string]: VNActorLayer }} layers The layers of the actor
 * @property {{ [key: string]: string }} signals The signals the actor responds to, and script to execute
 * @property {{ [key: string]: string }} defaults The default state of the actor
 * @property {string} css The styles to apply to the actor's container element
 */

/**
 * @typedef VNActorLayer
 * @property {string} name The name of the layer
 * @property {{ x: number, y: number }} offset The offset of the layer
 * @property {string} origin The origin of the layer
 * @property {{ [key: string]: string }} images The images of the layer, key: src
 * @property {number} depth The depth of the layer
 */

/**
 * @typedef VNPlace
 * @property {string} name The name of the place
 * @property {string} id The unique identifier of the place
 * @property {{
 *   [key: string]: {
 *    src: string,
 *    depth: number,
 *    css: string,
 *    scrollX?: number,
 *    scrollY?: number,
 *    scrollSpeed?: number,
 *    scrollDirection?: string,
 *   }
 * }} images The images of the place
 * @property {{
 *   [key: string]: {
 *     src: string,
 *     loop: boolean,
 *     volume: number,
 *     autoplay: boolean,
 *     channel: string,
 *   }
 * }} audio The audio of the place
 * @property {string} css The styles to apply to the place's container element
 */

/**
 * @class VNEngine
 * @description An extensible visual novel engine for the web.
 * @version 0.1.0
 * @license MIT
 * @author mkgiga
 */
export class VNEngine {
  /**
   * The HTML element that hosts the visual representation of the current scene (not created by the engine, but by the user).
   * @type {HTMLElement | null}
   */
  sceneHost = null;

  /**
   * The container for the visual representation of the current scene.
   * @type {HTMLElement | null}
   */
  sceneContainer = null;

  state = {

    /**
     * The current query object, which keeps track of
     * what objects are currently selected/being operated on.
     */
    query: {
      selected: undefined,
      buffer: "",
      history: [],
    },

    /**
     * Game objects are loaded and stored here so that they can be instantiated when needed.
     */
    objects: {
      actors: {},
      places: {},
    },

    /**
     * Preloaded audio and images are stored here and may be referenced via a URI.
     */
    project: {
      name: "Untitled Project",
      description: "",
      authors: [],
      version: "0.1.0",
      license: "MIT",

      /**
       * This object is treated as a directory tree. An object is a folder and anything else is a file.
       * Contains a couple of folders by default as a suggestion on how to organize your assets.
       */
      files: {
        images: {},
        audio: {},
        scripts: {},
      },

      /**
       * Any resources usable at runtime is stored here (actors, places, etc.)
       */
      objects: {
        actors: {},
        places: {},
      },

      /**
       * The compiled script, as in the tree of JSON instructions are stored here.
       */
      bin: {},

      /**
       * Project settings
       */
      settings: {},
    },
  };

  /**
   * Default object for any serialized VN object (HTML -> JSON).
   * @type {{
   *  type: string,
   *  id: string,
   *  props: { [key: string]: any }
   * }}
   */
  static #serializedObject = {
    type: "null",
    id: "null",
    props: {},
  };

  /**
   * Serializes a HTML element into a JSON object.
   * @param {HTMLElement} vnObject
   */
  serialize(vnObject = new HTMLElement()) {
    let res = "";

    if (vnObject.classList.contains("vn__actor")) {
    } else if (vnObject.classList.contains("vn__place")) {
    }

    throw new Error(
      "Cannot serialize object. Must be an element with class 'vn__actor' or 'vn__place'."
    );
  }

  deserialize(json = "") {
    let parsed = {};

    try {
      parsed = JSON.parse(json);
    } catch (error) {
      throw new Error(
        "Corrupt or invalid JSON provided during deserialization of object" +
          json
      );
    }

    if (parsed.type === "actor") {
    }
  }

  /**
   * A reference to the current instruction being executed
   * for logging and debugging purposes.
   */
  currentInstruction = null;

  debugConsole = null;

  #createDevTools() {
    const el = html`
      <div class="vn-devtools">
        <style>
          @scope (.vn-devtools) {
            @keyframes log-appear-text {
              from {
                transform: translateX(-50%);
                padding-left: 0;
              }

              to {
                transform: translateX(0);
                padding-left: 1rem;
              }
            }

            @keyframes log-background-error {
              from {
                /* feathered shining effect */
                filter: drop-shadow(0 0 4rem #fff);
                background-color: rgba(255, 255, 255, 0.25);
              }

              to {
                filter: drop-shadow(0 0 0.5rem crimson);
                background-color: rgba(220, 20, 60, 0.2);
              }
            }

            @keyframes log-error-icon {
              0% {
                transform: scale(1);
                filter: invert(0);
              }
              12.5% {
                transform: scale(1.5);
                filter: invert(1);
              }
              25% {
                transform: scale(1);
                filter: invert(0);
              }
              37.5% {
                transform: scale(1.5);
                filter: invert(1);
              }
              50% {
                transform: scale(1);
                filter: invert(0);
              }
              62.5% {
                transform: scale(1.5);
                filter: invert(1);
              }
              75% {
                transform: scale(1);
                filter: invert(0);
              }
              87.5% {
                transform: scale(1.5);
                filter: invert(1);
              }
              100% {
                transform: scale(1);
                filter: invert(0);
              }
            }

            :scope {
              
              --text-scroll-transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

              /* exponential ease-out timing function */
              transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
              display: flex;
              flex-direction: column;
              
              text-align: center;
              justify-content: flex-start;
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 50vh;
              background-color: rgba(0, 0, 0, 0.75);
              padding: 0;
              z-index: 10000000000;

              &[hidden] {
                display: none;
              }

              backdrop-filter: blur(16px);
            
              p {
                color: #fff;
              }

            

            .vn-devtools__top {
              display: flex;
              flex-direction: row;

              align-content: center;
              align-items: center;
              text-align: center;
              gap: 0.25rem;
              padding: 0.5rem;

              h2 {
                color: #fff;
                margin: 0;
                padding: 0;
                font-size: 1.25rem;
                padding-left: 0.5rem;
              }

              overflow: hidden;
              max-height: 10vh;

              .vn-devtools__top__right {
                margin-left: auto;
              }

              button {
                font-size: 1.5rem;
                cursor: pointer;
                background-color: transparent;
                border: none;
                color: #fff;
                text-shadow: 1px 1px 1px #000;
                outline: none;

                &:hover {
                  background-color: #000;
                  color: #fff;
                }

                &:active {
                  background-color: #fff;
                  color: #000;
                }
              }
            }

            .vn-devtools__content {
              position: relative;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
              flex: 1;
              height: 100%;
            }

            .vn-devtools__content__handle {
              position: relative;
              display: flex;
              height: 100%;
              width: 0;
              box-sizing: content-box;
              border-left: 1px double #fff;
              cursor: ew-resize;
            }

            .vn-devtools__content__handle {
              display: none;
            }
            

            .vn-devtools__console {
              
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;
              gap: 1rem;
              padding: 1rem;
              text-align: left;
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
              
              

              header {
                margin-bottom: auto;
                margin-top: 0;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                background-color: transparent;
                color: #fff;

                h3 {
                  margin: 0;
                  padding: 0;
                  font-size: 1rem;
                }

                
              }

              .vn-devtools__console_output {
                box-sizing: border-box;
                display: inline-flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                text-align: left;
                justify-content: flex-end;
                gap: 0.25rem;
                text-shadow: 1px 1px 1px #000;
                overflow-y: auto;
                flex-1;
                height: 100%;
                width: 100%;

                font-family: monospace;
                
                span.log {
                  display: flex;
                  margin: 0;
                  padding: 0;
                  font-size: calc(1rem * var(--log-text-size));
                  text-shadow: 0 0 1rem royalblue;
                  color: #fff;

                  place-self: flex-start;
                  animation: log-appear-text 0.2s cubic-bezier(0.19, 1, 0.22, 1) forwards,
                    log-appear-background 1s cubic-bezier(0.19, 1, 0.22, 1) forwards;

                  width: 100%;
                }

                span.log-bad {
                  display: flex;
                  animation: log-appear-text 0.2s cubic-bezier(0.19, 1, 0.22, 1) forwards,
                    log-background-error 1s cubic-bezier(0.19, 1, 0.22, 1) forwards;

                  overflow: hidden;
                  
                  span.log-error-icon {
                    margin-left: auto;
                    margin-right: 0.5rem;
                    animation: log-error-icon 4s ease alternate infinite;
                  }
                }
              }

              .vn-devtools__console_input {
                display: flex;
                width: 100%;
                place-self: flex-end;
                
                input {
                  display: flex;
                  flex: 1;
                  width: 100%;
                  padding: 0.5rem;
                  font-size: 1rem;
                  font-family: monospace;
                  background-color: transparent;
                  color: #fff;
                  border: 1px solid #fff;
                  outline: none;
                  height: max-content;

                  &:active {
                    background-color: #000;
                    color: #fff;
                  }

                  &:hover {
                    background-color: #000;
                    color: #fff;
                  }

                  &::placeholder {
                    color: #fff;
                    opacity: 0.5;
                  }
                }
              }

              .vn-devtools__console_toolbar {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                margin-top: auto;
                margin-bottom: 0;
                padding: 0;
                align-items: center;
                font-size: 1rem;
                
                label {
                  margin-right: 0.5rem;
                  color: #fff;
                  text-shadow: 1px 1px 1px royalblue;
                  white-space: nowrap;
                  border-left: double 4px #ffffff;
                  padding-left: 0.5rem;
                }

                input {
                  margin-right: 0.5rem;
                }

                input[type="range"] {

                  width: 100%;
                  -webkit-appearance: none;
                  background-color: transparent;
                  outline: none;
                  border: 1px solid #fff;
                  height: 1rem;
                  border-radius: 0.5rem;
                  border: 1px solid #fff;
                  cursor: pointer;
                  

                  
                  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
                  

                  &::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 1rem;
                    height: 1rem;
                    border-radius: 50%;
                    background-color: #fff;
                    cursor: pointer;

                    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
                  }

                  &:hover {
                    background-color: #000;
                    color: #fff;
                    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

                    filter: invert(1);
                  }

                  &::-webkit-slider-thumb:hover {
                    color: #fff;
                    transform: scale(1.25);
                    filter: invert(1);
                    outline: 2px solid #000;

                    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
                     
                    ::-webkit-slider-thumb:active {
                      background-color: #fff;
                      color: royalblue;
                    }
                  }
                }

                input[type="checkbox"] {
                  
                  

                  &:checked {
                    background-color: #fff;
                    color: #000;
                  }
                  
                  &:focus {
                    outline: 2px solid #fff;
                  }

                  &:active {
                    background-color: #000;
                    color: #fff;
                  }

                  &:hover {
                    background-color: #000;
                    color: #fff;
                  }
                  
                  &:checked:hover {
                    background-color: #fff;
                    color: #000;
                  }
                }
              }
            }

            .vn-devtools__tree {
              position: relative;
              display: flex;
              flex: 1;

              &:has(.vn-devtools__tree_output:empty) {
                display: none;
              }
            }


            .vn-devtools__tree_output {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;
              gap: 0.5rem;

              span.preprocessed-line {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                padding: 0;
                font-family: monospace;
                font-size: 1rem;
                text-align: left;
                text-justify: start;
                text-shadow: 1px 1px 1px #000;
              }
            }

            .vn-devtools__bottom {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              align-items: flex-start;
            }

            /* everything except for the top bar should be hidden by default */
            &:not([sticky]) {
              opacity: 0.25;
              transform: translateY(90%);
              
              &:not(:is(.vn-devtools__top)):not(:is([sticky])) {
                display: none;
                
                &:is(.vn-devtools) {
                  display: initial;
                }
              }

              &:is([sticky]) {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .vn-devtools__config {
             
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              
              &[hidden] {
                display: none;
              }
            }

            .vn-devtools__top__right .vn__devtools__collapse_panel {
              width: 1.5rem;
              height: 1.5rem;
              
              font-family: "Material Icons";
              font-size: 1.5rem;
              cursor: pointer;

              background-color: transparent;
              color: #fff;
              border: none;

              &:hover {
                background-color: #000;
                color: #fff;
              }
            }

            &[sticky] {
              .vn-devtools__top__right .vn__devtools__collapse_panel::before {
                content: "expand_more";
              }
            }
            
            &:not([sticky]) {
              .vn-devtools__top__right .vn__devtools__collapse_panel::before {
                content: "expand_less";
              }
            }
          }
        }
        </style>

        <div class="vn-devtools__top">
          <h2>Debug Panel</h2>

          <div class="vn-devtools__top__right">
            <span title="Collapse panel" class="material-icons vn__devtools__collapse_panel"></span>
            <button title="Settings" class="material-icons vn__devtools__settings">settings</button>
            <button title="Close panel" class="material-icons vn__devtools__close">close</button>
          </div>
        </div>
        <div class="vn-devtools__content">
          <div class="vn-devtools__console">
            <header>
              <h3>Console</h3>
            </header>
            <div class="vn-devtools__console_output"></div>
            <div class="vn-devtools__console_input">
              <input type="text" class="vn-devtools__console_input" />
            </div>
            <div class="vn-devtools__console_toolbar">
              
            </div>
          </div>
          <span class="vn-devtools__content__handle"></span>
          <div class="vn-devtools__tree">
            <header>
              <h3>Parser View</h3>
            </header>
            <div class="vn-devtools__tree_output"></div>

            </div>
          </div>
        </div>
        <div class="vn-devtools__bottom">
          
        </div>
        <div class="vn-devtools__config" hidden>
          <header>
            <h3>Settings</h3>
          </header>
          <ul class="vn-devtools__config_groups">
            <li class="vn-devtools__config_group" for="general">
              <h4>General</h4>
            </li>
            <li class="vn-devtools__config_group" for="appearance">
              <h4>Appearance</h4>
            </li>
            <li class="vn-devtools__config_group" for="audio">
              <h4>Audio</h4>
            </li>
            <li class="vn-devtools__config_group" for="debug">
              <h4>Debug</h4>
            </li>
          </ul>
        </div>
      </div>
    `;
    const consoleTop = el.querySelector(".vn-devtools__top");
    const consoleOutput = el.querySelector(".vn-devtools__console_output");
    const proto = Object.getPrototypeOf(el);

    proto.log = function (message = "", tags = ["log"]) {
      if (message instanceof HTMLElement) {
        consoleOutput.appendChild(message);
      } else {
        consoleOutput.appendChild(html`<span
          class="log"
          data-tags="${tags.join(",")}"
        >
          ${message}
        </span>`);
      }

      consoleOutput.scrollTop = consoleOutput.scrollHeight;

      return el;
    };

    proto.clear = function () {
      consoleOutput.innerHTML = "";

      return el;
    };

    proto.toggle = function () {
      el.hidden = !el.hidden;

      return el;
    };

    const outputContainer = el.querySelector(".vn-devtools__console_output");

    function onTextSizeChange(e) {
      const value = e.target.value;
      outputContainer.style.cssText = `font-size: ${value}%;`;
    }

    proto.toggleAutoScroll = function ({ state = null }) {
      const checkbox = el.querySelector(
        "#vn-devtools__console-option__autoscroll"
      );

      if (state === null) {
        checkbox.checked = !checkbox.checked;
      } else {
        checkbox.checked = state;
      }

      return el;
    };

    /**
     * Initialize the parser view with the post-preprocessing lines for an animated view of the parsing process.
     * (I'm a visual learner, so this helps me understand what I'm doing)
     * @param {PreprocessedLine[]} lines
     * @returns
     */
    proto.setTree = function (lines = []) {
      const output = el.querySelector(".vn-devtools__tree_output");
      output.innerHTML = "";

      function createIndentElement(el, level = 0) {
        const idt = html`<span class="idt"></span>`;
      }
      for (const line of lines) {
        const { t, text, y } = line;
        const span = html`
          <span class="preprocessed-line" style="margin-left: ${t}rem;">
            ${text}
          </span>
        `;
        output.appendChild(span);
      }

      return el;
    };

    el.addEventListener("mouseenter", () => {
      el.setAttribute("sticky", "");
    });

    const collapseButton = el.querySelector(".vn__devtools__collapse_panel");
    const closeButton = el.querySelector(".vn__devtools__close");
    const settingsButton = el.querySelector(".vn__devtools__settings");

    collapseButton.addEventListener("click", () => {
      el.toggleAttribute("sticky");
    });

    const input = el.querySelector(".vn-devtools__console_input input");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        
        if (input.value === "") {
          return;
        }

        const logMsg = html`
          <span class="log">
            <span class="log-text">
              ${input.value}
            </span>
          </span
        >`;

        const res = this.#parser.parse(input.value);

        if (!res.error) {
          logMsg.classList.add("log-good");
          logMsg.style.cssText = `
            color: #0f0;
            text-shadow: 1px 1px 1px #000;
          `;
        } else {
          const friendlyError = res.error.friendly;
          
          const errorMsg = html`
            <span class="log-parser-error">
              <span class="log-error-text">
                ${friendlyError}
              </span>
            </span>
          `;

          errorMsg.classList.add("log-bad");
          errorMsg.style.cssText = `
            color: salmon;
            text-shadow: 1px 1px 1px #000;
          `;

          logMsg.classList.add("log-bad");
          logMsg.style.cssText = `
            color: salmon;
            text-shadow: 1px 1px 1px #000;
          `;

          errorMsg.appendChild(html`<span class="log-error-icon">⚠️</span>`);
          consoleOutput.appendChild(logMsg);
          consoleOutput.appendChild(errorMsg);

          return;
        }

        consoleOutput.appendChild(logMsg);
      }

    });


    return el;
  }

  /**
   * Fetches a file from the server and returns it as either a,
   * - `Image` for a valid image file,
   * - `Audio` for a valid audio file,
   * - `Object` for a file containing a JSON-formatted string,
   * - `Blob` for any other file type.
   * - `null` if the file could not be loaded for any reason.
   *
   * @param {string} src The URI of the file to load.
   * @returns { Promise<Image | Audio | Object | Blob | null>[] }
   */
  async preload(...paths) {
    let promises = [];

    for (const path of paths) {
      const src = path;
      // format the URI so it can be placed in the assets dictionary
      let destinationURI = src.replace(/.*?:\/\//, "").replace(/\/+$|\\+$/, "");

      promises.push(this.#preload(src, destinationURI));
    }

    return Promise.all(promises);
  }

  setFile(uri = "", asset = new Image()) {
    const arr = uri.split("/");
    const stack = [this.state.assets];

    while (current !== undefined) {}
  }

  async #preload(
    src = "./images/actor.png",
    destinationURI = "john/head/happy"
  ) {
    const fetched = await fetch(src);

    if (!fetched.ok) {
      console.error(`Error: Could not fetch file at ${src}`);
      return null;
    }

    const blob = await fetched.blob();

    if (!blob) {
      console.error(`Error: Could not load file at ${src}`);
      return null;
    }

    const type = blob.type;
    let res = null;

    if (type.startsWith("image")) {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      this.state.assets.images[destinationURI] = img;
      res = img;
    } else if (type.startsWith("audio")) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      this.state.assets.audio[destinationURI] = audio;
      res = audio;
    } else if (type.startsWith("application/json")) {
      const json = await fetched.json();

      if (!json) {
        console.error(`Error: Could not parse JSON file at ${src}`);
        return null;
      }

      this.state.assets.files[destinationURI] = json;
      res = json;
    } else {
      this.state.assets.files[destinationURI] = blob;
      res = blob;
    }

    return res;
  }

  createInstruction({
    /**
     * Create a message to tell the engine what to do. The name of the action is required.
     * Actions are categorized by namespace, e.g 'actor>sprite>show', 'scene>set', 'audio>play', etc.
     * @type {string}
     */
    name = "actor>sprite>show",
    /**
     * @type {{ name: string, value: any }[]}
     */
    params = [
      { name: "actor", value: "anonymous" },
      { name: "visual", value: "pose-idle" },
    ],
  }) {
    const instruction = Object.create(null);

    if (arguments.length === 0) {
      return instruction;
    } else if (arguments.length === 1) {
      let obj = arguments[0];

      if (typeof obj === "object") {
        if (!obj.name) {
          throw new Error("Instruction object must have a 'name' property.");
        }
      } else if (typeof obj === "string") {
        // valid JSON string
        obj = JSON.parse(obj);
      } else {
        throw new Error("Invalid arguments provided to createInstruction.");
      }

      instruction.name = obj.name;
      instruction.params = obj.params || [];
    }

    return instruction;
  }


  /**
   * Creates an actor element with the specified properties.
   * This object is used both for its definition and for creating instances of actors.
   * @returns {VNActor}
   */
  createActor({
    name = "Jessica",
    id = name.toLowerCase().replace(/\s/g, "-"),
    description = "A disturbed, sick and demented individual who is a danger to herself and others.",
    text = {
      color: "#000000",
      font: "Arial",
      size: "normal",
      style: "normal",
    },
    layers = [
      {
        name: "face",
        offset: { x: 0, y: -275 },
        origin: "center",
        images: {
          neutral: "./images/characters/jessica/face-neutral.png",
          happy: "./images/characters/jessica/face-happy.png",
          sad: "./images/characters/jessica/face-sad.png",
          angry: "./images/characters/jessica/face-angry.png",
          shocked: "./images/characters/jessica/face-shocked.png",
          disgusted: "./images/characters/jessica/face-disgusted.png",
        },

        depth: 1,
      },
      {
        name: "pose",
        offset: { x: 0, y: 0 },
        images: {
          idle: "./images/characters/jessica/pose-idle.png",
          excited: "./images/characters/jessica/pose-excited.png",
          "arms-crossed": "./images/characters/jessica/pose-arms-crossed.png",
        },
        depth: 0,
      },
    ],

    signals = {
      ":)": "actor('jessica').layer('face').show('happy')",
      ":(": "actor('jessica').layer('face').show('sad')",
      ":O": "actor('jessica').layer('face').show('shocked')",
      ":|": "actor('jessica').layer('face').show('neutral')",
      ">:(": "actor('jessica').layer('face').show('angry')",
      ";/": "actor('jessica').layer('face').show('disgusted')",
      crossed_arms: "actor('jessica').layer('pose').show('arms-crossed')",
      excited: "actor('jessica').layer('pose').show('excited')",
      idle: "actor('jessica').layer('pose').show('idle')",
    },

    defaults = {
      layers: {
        face: "neutral",
        pose: "idle",
      },
    },

    css = "",
  }) {
    const actor = {
      name,
      id,
      description,
      text,
      layers,
      signals,
      defaults,
      css,
      element: () => {
        const el = html`
          <div id="actor-${id}">
            <style>
              @scope (.actor) {
                :scope {
                  ${css}
                }
              }
            </style>

            <div class="actor__sprites"></div>
          </div>
        `;

        const sprites = el.querySelector(".actor__sprites");

        for (const layer of layers) {
          const layerEl = html`
            <img
              src="${layer.images[layer.default || "neutral"]}"
              class="actor__layer actor__layer--${layer.name}"
              style="z-index: ${layer.depth};"
            />
          `;

          sprites.appendChild(layerEl);
        }

        return el;
      },
    };

    return actor;
  }

  createPlace({
    id = "my-room",
    name = "My Room",
    /**
     * An array of images to display in the place. Each image object should have a src property,
     * and optionally a depth property to control the stacking order of the images (CSS z-index),
     * A negative depth will place the image behind the actors (meaning it will be considered a background image,
     * while a positive depth will place the image in front of the actors (meaning it will be considered a foreground image).
     * `scrollX` and `scrollY` can be used to create a parallax effect without having to write any CSS.
     * @type {{ src: string, depth: number, css: string }[]}
     */
    images = [
      { src: "images/backgrounds/my-room.png", depth: -1, css: "" },
      { src: "images/backgrounds/my-room-foreground.png", depth: 1, css: "" },
      {
        src: "images/backgrounds/scrolling-fog.png",
        depth: 2,
        scrollX: 60,
        scrollY: 0,
        css: "",
      },
    ],
    audio = [
      { src: "audio/my-room.mp3", loop: true, volume: 0.5, autoplay: true },
      {
        src: "audio/my-room-ambient.mp3",
        loop: true,
        volume: 0.5,
        autoplay: true,
      },
    ],
    css = "",
  }) {
    const place = {
      id,
      name,
      images,
      audio,
      css,
      element: () => {
        const el = html`
          <div class="vn__scene_place" id="place-${id}">
            <style>
              @scope (.vn__scene_place) {
                :scope {
                  position: relative;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  width: 100%;
                  height: 100%;

                }

                :scope  > img {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }

                :scope > img {
                  img {
                    ${(() => {
                return images
                  .map((img, i) => {
                    return `
                        &:nth-child(${i + 1}) {
                          z-index: ${img.depth};
                          ${img.css}
  
                          ${
                            img.scrollX
                              ? `animation: scrollX ${img.scrollX}s linear infinite;`
                              : ""
                          }
                          ${
                            img.scrollY
                              ? `animation: scrollY ${img.scrollY}s linear infinite;`
                              : ""
                          }
                        }
                      `;
                  })
                  .join("\n\n");
              })()};
                  }
                }
                :scope {
                  /* Custom CSS which will override the default styles because it is declared last */
                  ${css}
                }
              }
            </style>
          </div>
        `;

        for (const img of images) {
          const imgEl = html`<img src="${img.src}" />`;
          el.appendChild(imgEl);
        }

        return el;
      },
    };

    return place;
  }

  #createSceneElement() {
    const scene = html`
      <div class="vn__scene">
        <style>
          @font-face {
            font-family: "Material Icons";
            font-style: normal;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/materialicons/v142/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2)
              format("woff2");
          }

          @scope (.vn__scene) {
            :scope {
              /* Default styles for various elements */
              --dialogue-font: sans-serif;
              --dialogue-color: white;
              --dialogue-background: rgba(0, 0, 0, 0.5);
              --dialogue-text-shadow: 1px 1px 1px #000;

              --option-hover-color: #eee;
              --option-active-color: #ddd;
              --option-list-style: none;

              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
              min-width: 100%;
              min-height: 100%;
              margin: 0;
              padding: 0;
              z-index: 0;

              overflow: hidden;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            .material-icons {
              font-family: "Material Icons";
              font-weight: normal;
              font-style: normal;
              font-size: 24px;
              line-height: 1;
              letter-spacing: normal;
              text-transform: none;
              display: inline-block;
              white-space: nowrap;
              word-wrap: normal;
              direction: ltr;
              -webkit-font-feature-settings: "liga";
              -webkit-font-smoothing: antialiased;
            }

            :scope > .vn__object_defaults {
              display: none;
            }

            :scope > .vn__place {
              display: flex;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;

              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;

              text-align: center;
              text-justify: center;

              object-fit: cover;

              z-index: -1;

              .vn__scene_place {
                background-color: gray;

                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;

                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;

                text-align: center;
                text-justify: center;

                object-fit: cover;

                z-index: -1;

                .vn__scene_place > img {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                }
              }
            }

            :scope > .vn__actors {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;

              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;

              z-index: 0;
            }

            :scope > .vn__dialogue {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 25%;

              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;

              background-color: rgba(0, 0, 0, 0.5);

              /* gui exists starting from z-index 1000000 */
              z-index: 1000000;

              span {
                user-select: none;
              }

              .dialogue__speakers {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                place-self: flex-start;
                text-align: left;
                text-justify: start;
                margin: 0;
                margin-left: 1rem;

                span.speaker {
                  font-size: 1.5rem;
                  font-family: var(--dialogue-font, sans-serif);
                  color: var(--dialogue-color, white);
                }
              }

              .dialogue__text {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                text-align: left;
                height: 100%;

                span {
                  margin: 0;
                  padding: 0;

                  font-size: 1.5rem;
                  font-family: var(--dialogue-font, sans-serif);
                  color: var(--dialogue-color, #000);

                  text-justify: start;
                  text-align: left;

                  white-space: pre-wrap;
                }

                span.dialogue__entry {
                  margin: 0;
                  padding: 0;

                  font-size: 1rem;
                  font-family: var(--dialogue-font, sans-serif);
                  color: var(--dialogue-color, #000);

                  transition: var(--text-scroll-transition);
                }

                &:empty {
                  display: none;
                }
              }

              .dialogue__choice {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;

                margin: 0;
                padding: 0;

                width: 100%;
                height: 100%;

                .choice__title {
                  font-size: 1.5rem;
                  font-family: var(--dialogue-font, sans-serif);
                  color: var(--dialogue-color, #000);
                  font-weight: normal;
                  text-align: left;
                  padding-left: 2rem;
                  place-self: flex-start;
                }

                .option__list {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  list-style-type: none;
                  padding: 0;
                  margin: 0;

                  width: 100%;
                  height: 100%;
                  flex: 1;

                  .option__item {
                    font-size: 1.5rem;
                    font-family: var(--dialogue-font, sans-serif);
                    color: var(--dialogue-color, #000);
                    cursor: pointer;
                    padding: 0.5rem;
                  }
                }

                .option__item:hover {
                  background-color: var(--vn-option-hover-color, #eee);
                }

                .option__item:active {
                  background-color: var(--vn-option-active-color, #ddd);
                }

                &:empty {
                  display: none;
                }
              }

              .dialogue__toolbar {
                position: relative;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                min-width: 100%;
                min-height: 2rem;
                place-self: flex-end;
                margin-top: auto;

                &:empty {
                  display: none;
                }
              }

              .dialogue__toolbar > button {
                font-size: 1.5rem;
                font-family: var(--dialogue-font, sans-serif);
                color: var(--dialogue-color, #000);
                cursor: pointer;
                padding: 0.5rem;

                &:hover {
                  background-color: var(--vn-option-hover-color, #eee);
                }

                &:active {
                  background-color: var(--vn-option-active-color, #ddd);
                }
              }
            }
          }
        </style>

        <div class="vn__place"></div>
        <div class="vn__actors"></div>
        <div class="vn__dialogue">
          <div class="dialogue__speakers"></div>
          <div class="dialogue__text"></div>
          <div class="dialogue__choice">
            <h3 class="choice__title">Undefined</h3>
            <ul class="option__list"></ul>
          </div>
          <div class="dialogue__toolbar"></div>
        </div>
      </div>
    `;

    const dialogueBox = scene.querySelector(".vn__dialogue");
    const dialogueText = dialogueBox.querySelector(".dialogue__text");
    const dialogueSpeakers = dialogueBox.querySelector(".dialogue__speakers");
    const dialogueChoice = dialogueBox.querySelector(".dialogue__choice");

    dialogueText.addEventListener("click", (e) => {
      const currentEntry = dialogueText.querySelector(".dialogue__entry");
      if (currentEntry) {
        this.tryNext(currentEntry);
      }
    });

    return scene;
  }

  tryNext(entry = document.querySelector(".dialogue__entry")) {
    if (!entry) {
      return;
    }

    if (entry.hasAttribute("noskip")) {
      return;
    }

    const fullText = entry.getAttribute("full-text");

    // if the text has not finished scrolling, we set the text to the full text
    if (entry.textContent.trim() !== fullText) {
      entry.textContent = fullText;
    } else {
      this.next();
    }
  }

  next() {
    document.querySelector(".dialogue__text").innerHTML = "";
    document.querySelector(".dialogue__choice").innerHTML = "";

    console.log("Next instruction...");

    this.stack[this.stack.length - 1].i++;
    this.paused = false;
    this.execute({ target: this.stack[this.stack.length - 1] });
  }

  /**
   * Creates a new instance of the engine.
   * @param {HTMLElement} sceneContainer The container for the visual representation of the current scene.
   * @param {string | Array<{ name: string, params: Object }>} script The script to execute.
   */
  constructor({
    sceneHost = document.body,
    script = '',
    autoRun = true,
  }) {
    
    console.log(sceneHost);

    if (!script) {
      throw new Error("No script provided.");
    }

    if (!sceneHost instanceof HTMLElement) {
      throw new Error("Invalid scene host provided. Must be an HTMLElement.");
    }

    this.sceneHost = sceneHost;
    const sceneContainer = this.initSceneHost(sceneHost);
    this.sceneContainer = sceneContainer;

    let result;

    if (typeof script === "string") {
      // if it is a valid JSON string, we just run it
      try {
        result = JSON.parse(script);
      } catch (error) {
        // it's not a JSON string, it's probably a .vns script.
        result = script;
      } finally {
        
        if (autoRun) {
          return this.run({
            sceneContainer,
            script: result,
          });
        } 
      }
    } else if (Array.isArray(script)) {
      if (autoRun) {
        return this.run({
          sceneContainer,
          script,
        });
      }
    } else {
      throw new Error(
        "Invalid script provided. Must be a valid .vns script or an array of interpreter instructions."
      );
    }
  }

  /**
   * Non-recursive search for the context (function/if/else/loop/etc.) with the specified name somewhere in the context tree.
   * When it finds the variable (path[0]), it will call itself with the parent context and the rest of the path.
   * @param {string} name
   * @returns {VNContext | undefined}
   */
  #findContext(path = [], traverseStack = []) {
    const currentContext = traverseStack.pop
      ? traverseStack.pop()?.target
      : traverseStack;
    const name = path.shift ? path.shift() : path;

    // does this exist in the current context?
    const found = currentContext?.variables[name];

    if (!currentContext) {
      console.log(path.length);
      this.instructions.debug.log({
        message: `Context '${name}' is undefined.`,
        tags: ["engine", "error"],
      });
      throw new Error("Context <" + name + "> is undefined.");
    }

    if (found) {
      console.log(traverseStack.length);
      return found;
    }

    // if not, we check the parent context
    return this.#findContext(name, traverseStack);
  }

  /**
   * Root context for the instruction stack.
   */
  global = {
      parent: null,
      depth: 0,
      name: "global",
      parameters: [],
      body: [],
      variables: {},
      condition: "true",
      options: {}, // metadata (reserved for future use)
      value: undefined,
    }

  /**
   * The stack of contexts for the engine for context traversal.
   */
  stack = [{ target: this.global, i: 0 }];

  /**
   * Creates a new context object.
   * @param {string} name
   * @param {{ [key: string]: any }} variables
   * @param {Array<VNInstruction>} body
   * @param {{ [key: string]: any }} options
   * @param {VNContext} parent
   * @param {string} condition
   * @param {any} value
   * @returns {VNContext} The new context object.
   */

  /**
   * An object containing a series of instructions that can be executed by the engine
   * as well as a local scope for variables.
   * @typedef {Object} VNContext
   * @property {string} name
   * @property {{ [key: string]: any }} variables
   * @property {{ [key: string]: any }} options
   * @property {VNContext | null} parent
   * @property {Array<VNInstruction>} body - The instructions
   * @property {string | undefined} condition - Evaluated at as a boolean at runtime
   * @property {any} value
   */
  #createContext({
    name = "anonymous",
    parameters = [],
    variables = {},
    options = {},
    parent = null,
    body = [],
    condition = undefined,
    value = undefined,
  }) {
    return {
      name,
      parameters,
      variables,
      options,
      parent,
      body,
      condition,
      value,
    };
  }

  get currentContext() {
    if (this.stack.length === 0) {
      return null;
    }

    return this.stack[this.stack.length - 1];
  }

  set currentContext(ctx) {
    this.stack.push(ctx);
  }

  paused = false;

  /**
   * @typedef {{
   * name: string,
   * params: Object,
   * type: string,
   * options?: { [key: string]: any }
   * }} VNInstruction
   */

  /**
   * A visualization of traversing the instruction tree
   * during initialization, parsing and execution.
   */
  #createVisualTreeElement() {
    const sceneContainer = this.sceneContainer;

    /**
     * Creates a new tree node element, which contains other nodes as children,
     * anything that isn't a .vn-devtools__tree_node won't be expandable or collapsible.
     * @param {{ title: string, children: HTMLElement[], style: string }} options
     * @returns {HTMLElement}
     */
    const node = ({ id = "", children = [], style = "" }) => {
      const el = html`<span class="vn-devtools__tree_node" style="${style}">
        ${id instanceof HTMLElement ? id : id ? id : ""}
        ${children.length > 0
          ? `<div class="vn-devtools__tree_children tree-id="${id}">
            ${children.map((child) => {
              if (child instanceof HTMLElement) {
                return child.outerHTML;
              } else if (typeof child === "string") {
                return child;
              } else {
                throw new Error(
                  "Invalid child element provided while creating a tree node."
                );
              }
            })()}
          </div>`
          : ""}
      </span>`;

      const proto = Object.getPrototypeOf(el);

      proto.find = (nodeId = "") => {
        return el.closest(`[tree-id="${nodeId}"]`);
      };

      proto.findFromRoot = (nodeId = "") => {
        return sceneContainer.querySelector(
          `.vn-devtools__tree_node .vn-devtools__tree_output [tree-id="${nodeId}"]`
        );
      };

      proto.add = (child) => {
        const children = el.querySelector(".vn-devtools__tree_children");

        if (!children) {
          throw new Error("Cannot add a child to a non-container branch.");
        }

        children.appendChild(child);
      };

      return el;
    };

    const container = node({ id: "root", children: [] });

    return container;
  }

  /**
   * Iterate over the entire instruction tree and
   * declare all the functions, variables, and other objects
   * ahead of time so that functions can be called before they are declared in the script.
   */
  #initializeContexts(instructions = []) {
    console.log("[INIT] Initializing contexts...");
    // keeping track of where we left off in the parent context
    const stack = [{ target: this.global, i: 0 }];

    const getContext = () => {
      return stack[stack.length - 1].target;
    };

    /** So we know where we left off when we return to the parent context */
    const previousIndex = () => {
      return stack[stack.length - 1]?.i ?? 0;
    };

    const stacklog = (message = "", offset = 0) => {
      console.log("  ".repeat(stack.length + offset) + " " + message);
    };

    this.global.body = instructions;

    stacklog("=> global", -1);

    outer: while (stack.length > 0) {
      const ctx = stack[stack.length - 1];

      inner: for (
        let i = previousIndex() + 1;
        i < getContext().body.length;
        i++
      ) {
        stack[stack.length - 1].i = i; // update the index in the stack

        const inst = ctx.target.body[i];
        const name = ctx.target.name;
        const params = inst?.params || {};

        const [...ns] = inst.name.split(".");

        // we only care about engine.assign instructions
        if (ns[0] !== "engine" && ns[1] !== "context" && ns[2] !== "declare") {
          stack[stack.length - 1].i = i;
          continue inner;
        }

        const type = ns[3];

        if (!type) {
          throw new Error("Instruction type not provided.");
        }

        switch (type) {
          case "fn":
            const funcName = params.name;
            const funcBody = structuredClone(params.body);
            const funcParams = structuredClone(params.parameters);

            const newCtx = {
              type: "fn",
              value: {
                parent: ctx.target,
                type: "fn",
                name: funcName,
                parameters: funcParams,
                variables: {},
                body: funcBody,
                value: undefined,
              },
            };

            ctx.target.variables[funcName] = newCtx.value;
            stack.push({ target: newCtx.value, i: -1 });

            stacklog(`=> ${funcName}`, -1);
            continue outer; // skip the rest of the loop until we return to this context

          case "var":
            // variables should be known at compile time
            // but we cannot assign a value to them until runtime
            const varName = params.name;

            ctx.variables[varName] = {
              type: "var",
              value: undefined,
            };

            stacklog(`$${varName}`, 0);
            break;
        }
      }

      stacklog(`<= ${ctx.target.name}`, -1);
      stack.pop();
    }
    console.log(this.global);
  }

  /**
   * @type {VNEngineParser}
   * @private
   */
  #parser = null;

  /**
   * The script is parsed into an intermediate representation that the engine can understand,
   * then executed by the engine.
   * @param {string | Array<{ name: string, params: Object }>} script
   */
  run({
    sceneContainer = document.body,
    script = [],
    options = {
      debug: {
        enabled: true,
        breakpointAll: false,
        breakpoints: [],
      },
    },
  }) {
    // 1. Check if the scene element exists. We may need to initialize it.
    if (!this.sceneContainer) {
      const sceneHost = this.sceneHost;

      if (!sceneHost) {
        throw new Error("No scene host provided.");
      }

      const sceneContainer = this.initSceneHost(sceneContainer);
      this.sceneContainer = sceneContainer;

      if (!sceneContainer) {
        throw new Error("Could not create a scene element.");
      }
    }

    // 2. Make sure we have a parser instance
    if (!this.#parser) {
      this.#parser = new VNEngineParser({
        text: script,
        ctx: this.global,
        t: 0,
        x: 0,
        y: 0,
      });
    }

    // If we don't know how to treat this, we throw an error
    if (typeof script !== "string" && !Array.isArray(script)) {
      throw new Error("Invalid script provided.");
    }

    // 3. Parse the script if necessary

    /**
     * This must be the intermediate representation of the script that the engine can understand
     * (An array [{ name: string, params: Object, type: string, options?: { [key: string]: any } }])
     * @type {Array<{ name: string, params: Object }>}
     */
    let res = Array.isArray(script) ? script : this.#parser.parse();

    console.log(res);

    // Let the user know if there was an error in the script
    if (res.error) {
      const friendlyError = res.error.friendly;
      const nerdError = res.error.nerd;

      this.instructions.debug.log({
        message: friendlyError,
        tags: ["engine", "parser", "error"],
      });

      throw new Error(nerdError);
    }

    console.log("Parsed script:", res);
    debugger;

    // load the instructions into the global context
    this.global = res.value.context;

    // 4. If any JS code was parsed, we execute it before running so that
    // any plugins, functions or variables are available to the script

    for (const js of res.value.js) {
      try {
        // any declarations will be available to reference in the script
        const ev = new Function(js);
        ev.bind(this.global.variables);
        ev();
      } catch (error) {
        this.instructions.debug.log({
          message: `Error in JS code: ${error.message}`,
          tags: ["engine", "error"],
        });
        throw new Error(`Error in JS code: ${error.message}`);
      }
    }

    // 4. Initialize the contexts. Label functions must be able to be referenced before they are declared.
    this.#initializeContexts(script);

    /**
     * The global context for the script.
     */
    const ctx = this.global;
    this.stack = [{ target: ctx, i: 0 }];
    const stack = this.stack;

    // 5. Execute the script
    this.execute({ target: stack, i: 0 });
  }

  i = 0;

  /**
   * Executes the script resuming from where it left off.
   * @param {{ target: VNContext, i: number }} options
   * @returns {VNInstruction | undefined}
   * @async
   * @private
   */
  async execute({ target, i = 0 }) {
    console.log("Resuming execution...");
    console.log("Target:", target);
    console.log("Index:", this.stack[this.stack.length - 1].i);
    const stack = this.stack;

    // executing the local context
    const pair = stack[stack.length - 1];
    const ctx = pair.target;

    // resume execution from where we left off
    for (
      let i = this.stack[stack.length - 1].i;
      i < ctx.body.length && !this.paused;
      i++
    ) {
      this.stack[stack.length - 1].i = i;
      const inst = ctx.body[i];

      this.currentInstruction = inst;
      const name = inst.name;
      const params = inst?.params || {};
      const [...ns] = name.split(".");

      const targetCallback =
        ns.reduce((acc, ns, i) => {
          try {
            return acc[ns];
          } catch (error) {
            const badPath = name
              .split(".")
              .slice(0, i + 1)
              .join(".");
            const responsibleFork = name.split(".").slice(0, i).join(".");

            console.error(`
              Error: Instruction path '${badPath}' does not exist. (No such instruction '${ns}' in '${responsibleFork}')
              `);
            return undefined;
          }
        }, this.instructions) || undefined;

      if (!targetCallback) {
        throw new Error(
          `Error: Instruction '${name}' does not exist. Please check the compiled script.`
        );
      }

      // a function means it is a command to execute
      if (typeof targetCallback === "function") {
        console.log(`Executing instruction: ${name}`);
        // so we can access the context of the engine inside the instructions object
        let result = targetCallback.call(this, { ...params });

        if (result) {
          if (result instanceof Promise) {
            console.log("Awaiting promise...");
            // Timed instructions will be awaited
            result = await result;
          }
        }

        if (this.shouldPauseExecution(name)) {
          this.paused = true;
          return inst;
        }
      }
    }

    console.log("Execution complete.");
  }

  initSceneHost(sceneHost = document.body) {

    // check if the scene element exists
    let scene = sceneHost.querySelector(".vn__scene");

    if (!scene) {
      scene = this.#createSceneElement();
      sceneHost.appendChild(scene);
    }

    const devTools = this.#createDevTools();
    scene.appendChild(devTools);
    this.debugConsole = devTools;

    return scene;
  }

  setScene(targetContainer = document.body) {
    const scene = this.#createSceneElement(targetContainer);

    if (!targetContainer) {
      throw new Error("No target container provided.");
    }

    const target = document.querySelector(targetContainer);

    if (target.querySelector(".vn__scene")) {
      target.removeChild(target.querySelector(".vn__scene"));
      target.appendChild(scene);
    } else {
      target.appendChild(scene);
    }
  }

  get hasInitialized() {
    return [
      document.querySelector(".vn__scene"),
      document.querySelector(".vn-devtools"),
    ].every((el) => el !== null);
  }

  init({ targetContainer = document.body }) {
    return new VNEngine(targetContainer);
  }

  shouldPauseExecution(instruction = "dialogue.entry") {
    const WAIT_FOR_USER_INPUT = ["dialogue.entry", "dialogue.choice"];

    return WAIT_FOR_USER_INPUT.includes(instruction);
  }

  /**
   * Instruction parameters must be JSON-serializable, and the only argument should be an object containing the parameters.
   * @typedef {{
   *  [key: string]: any
   * }} VNInstructionCallbackParams
   */

  /**
   * A collection of instructions that can be executed by the engine.
   * @typedef {{
   *  [key: string]: (params: VNInstructionCallbackParams) => any
   * }} VNInstructions
   */

  /**
   * Contains all the built-in instructions that can be executed by the engine,
   * categorized by namespace (the type of instruction, subtype, etc.)
   * @type {VNInstructions}
   */
  instructions = {
    when: ({ event = "sceneend", listener = (e) => console.log(e) }) => {
      document.querySelector(".vn__scene").addEventListener(event, listener);
    },

    /** Shorthand for manipulating the scene. */
    scene: {
      set: {
        place: ({ id = "my-room" }) => {
          const places = this.state.project.objects.places;
          const place = places[id];

          if (!place) {
            console.log(this.state.project.objects.places);
            throw new Error(`Error: Place [${id}] does not exist.`);
          }

          const scene = document.querySelector(".vn__scene > .vn__place");
          scene.innerHTML = "";

          scene.appendChild(place.element());

          this.instructions.debug.log({
            message: `Set scene to place '${place.id}'.`,
          });

          return place;
        },

        actor: ({ id = "anonymous" }) => {
          const actors = this.state.project.objects.actors;
          const actor = actors[id];

          if (!actor) {
            throw new Error(`Error: Actor [${id}] does not exist.`);
          }

          const actorsContainer = document.querySelector(
            ".vn__scene > .vn__actors"
          );
          actorsContainer.innerHTML = "";

          actorsContainer.appendChild(actor.element());

          this.instructions.debug.log({
            message: `Set scene to actor '${actor.id}'.`,
          });

          return actor;
        },
      },
    },

    new: {
      place: ({
        name = "My Room",
        id = name.toLowerCase().replace(/\s/g, "-"),
        background = "images/backgrounds/my-room.png",
        images = [],
        audio = [],
        css = "",
      }) => {

        const place = this.createPlace({
          name,
          id,
          background,
          images,
          audio,
          css,
        });

        const loadedPlaces = this.state.project.objects.places;

        this.instructions.debug.log({
          message: `Created new place '${name}' with ID '${id}'.`,
        });

        loadedPlaces[id] = place;

        return place;
      },
      actor: ({
        name = "Anonymous",
        id = name.toLowerCase().replace(/\s/g, "-"),
        description = "Who could it be?",
        layers = [],
        signals = {},
        defaults = {},
        css = "",
      }) => {
        const actor = this.createActor({
          name,
          id,
          description,
          layers,
          signals,
          defaults,
          css,
        });

        const loadedActors = this.state.project.objects.actors;

        this.instructions.debug.log({
          message: `Created new actor '${name}' with ID '${id}'.`,
        });

        loadedActors[id] = actor;

        return actor;
      },
    },
    dialogue: {
      speakers: {
        /**
         *
         * @param {{ speakers: string[] }} options
         */
        set: ({ speakers = ["anonymous"] }) => {
          const target = document.querySelector(".dialogue__speakers");
          target.innerHTML = "";

          for (const speaker of speakers) {
            const actor = this.state.project.objects.actors[speaker];
            const name = actor ? actor.name : speaker;

            const el = html` <span class="speaker">${name}</span> `;

            target.appendChild(el);
          }
        },
        add: ({ speakers = ["anonymous"] }) => {
          const target = document.querySelector(".dialogue__speakers");

          for (const speaker of speakers) {
            const actor = this.state.project.objects.actors[speaker];
            const name = actor ? actor.name : speaker;

            const el = html` <span class="speaker">${name}</span> `;

            target.appendChild(el);
          }
        },
        remove: ({ speakers = ["anonymous"] }) => {
          const target = document.querySelector(".dialogue__speakers");

          for (const speaker of speakers) {
            const span = target.querySelector(`span:contains(${speaker})`);
            span.remove();
          }
        },
      },

      clear: () => {
        const textContainer = document.querySelector(".dialogue__text");
        textContainer.innerHTML = "";
        const choiceContainer = document.querySelector(".dialogue__choice");
        choiceContainer.innerHTML = "";

        this.instructions.debug.log({
          message: "Cleared the dialogue box.",
        });
      },

      scrollSpeed: ({ speed = 50 }) => {
        const target = document.querySelector(".dialogue__text");
        target.setAttribute("scroll-speed", speed);
      },

      scroll: ({ enabled = true }) => {
        const target = document.querySelector(".dialogue__text");

        if (enabled) {
          target.setAttribute("scroll", "");
        } else {
          target.removeAttribute("scroll");
        }
      },

      entry: ({ text = "Hello, world!" }) => {
        this.instructions.dialogue.clear();

        const inlineCommandDelim = ["[", "]"];

        const target = document.querySelector(".dialogue__text");
        const textElement = html`
          <span class="dialogue__entry">${text}</span>
        `;

        textElement.setAttribute("full-text", text);

        function evaluateInlineCommand(buffer = "...") {
          if (buffer.match(/\.+/)) {
            // a series of dots means to pause scrolling momentarily
            let scrollSpeed = target.getAttribute("scroll-speed") || 50; // ms
          }
        }

        target.appendChild(textElement);
        let current = "";
        let buffer = null;
        if (target.hasAttribute("scroll")) {
          const fullText = target.getAttribute("full-text");
          const scrollSpeed = target.getAttribute("scroll-speed") || 50;

          let tmr = setInterval(() => {
            const i = current.length;
            const c = fullText[current.length];

            if (c === undefined) {
              clearInterval(tmr);
              return;
            }

            if (c === inlineCommandDelim[0]) {
              buffer = "";
            } else if (c === inlineCommandDelim[1]) {
              buffer = null;
            } else {
              current += c;
            }
          }, scrollSpeed);
        }
      },

      choice: ({ text = "", choices = [] }) => {
        const target = this.sceneContainer.querySelector(
          ".vn__dialogue .dialogue__choice"
        );
        const title = html`<h3 class="choice__title">${text}</h3>`;
        const list = html`<ul class="option__list"></ul>`;

        this.instructions.debug.log({
          message: `Created a choice dialogue with title '${text}'.`,
        });

        for (const option of choices) {
          const text = option.text || "";
          const goto = option.goto || "";

          const el = html`<li class="option__item" data-goto="${goto}">
            ${text}
          </li>`;

          el.addEventListener("click", (e) => {
            this.instructions.dialogue.choose({
              goto: e.target.dataset.goto.trim(),
            });
          });

          list.appendChild(el);
        }

        target.appendChild(title);
        target.appendChild(list);

        target.hidden = false;
      },

      /**
       * Chooses an option from a list of choices.
       * @param {{ goto: VNContext }} param0
       */
      choose: ({ goto = undefined }) => {
        // this function pushes the context to the stack
        this.instructions.engine.context.goto({ target: goto });

        // resume execution from where we left off
        this.paused = false;
        this.execute({
          target: this.stack[this.stack.length - 1],
          i: this.stack[this.stack.length - 1].i,
        });
      },

      /**
       * This namespace is is a collection that has nothing in it by default,
       * it is the root namespace for any custom instructions that plugins or scripts may add.
       */
      extended: {

      },
    },

    time: {
      wait: ({ h = 0, m = 0, s = 0, ms = 0 }) => {
        const time = h * 3600 + m * 60 + s + ms / 1000;
        return new Promise((resolve) => setTimeout(resolve, time));
      },
    },

    debug: {
      log: ({ message = "Hello, world!", tags = [""] }) => {
        this.debugConsole.log(message);
      },
      clear: () => {
        this.debugConsole.clear();
      },
      toggle: () => {
        this.debugConsole.toggle();
      },
      autoscroll: ({ enabled = true }) => {
        if (enabled) {
          this.debugConsole.toggleAutoScroll({ state: true });
        }
      },
    },

    engine: {
      select: ({ ids = [] }) => {
        const objects = this.state.project.objects;
        const found = objects.actors[id] || objects.places[id];

        if (!found) {
          this.instructions.debug.log({
            message: `Error: Object '${id}' does not exist.`,
            tags: ["error"],
          });

          throw new Error(`Object '${id}' does not exist.`);
        }

        this.state.query.selected = [found];
      },
      context: {
        goto: ({ target = "" }) => {
          const traverseStack = [];

          for (let i = 0; i < this.stack.length; i++) {
            traverseStack.push(this.stack[i]);
          }

          const arr = target.split("->");
          const ctx = this.#findContext(arr, traverseStack);
          const resCtx = ctx.variables[arr[arr.length - 1]];

          if (!ctx) {
            throw new Error(
              `Error: Context ['${target.name}'] containing variable ['${
                arr[arr.length - 1]
              }'] does not exist.`
            );
          }

          if (!resCtx) {
            throw new Error(
              `Error: Variable ['${
                arr[arr.length - 1]
              }'] does not exist in context ['${target.name}'].`
            );
          }

          this.stack.push({ target: resCtx, i: 0 });
          console.log("Jumped to context:", ctx);
          return ctx;
        },
        declare: {
          fn: ({ name = "", parameters = [], body = [], meta = {} }) => {
            // skip because all declarations are done at compile time
            console.log(this.currentContext.target.variables[name]);
          },
        },
      },
    },

    create: {
      actor: ({ id = "anonymous" }) => {
        const newActor = this.createActor({ 
          id,
          name: "",
          description: "",
          layers: [],
          signals: {},
          defaults: {},
          css: "", 
        });

        this.state.project.objects.actors[id] = newActor;
        this.state.query.selected = [newActor];

      },
      place: ({ id = "my-room" }) => {
        const newPlace = this.createPlace({
          id,
          name: "",
          images: [],
          audio: [],
          css: "",
        });

        this.state.project.objects.places[id] = newPlace;
        this.state.query.selected = [newPlace];

      },
    },

    load: {
      project: async ({ path = "" }) => {
        const project = await this.loadProject(path);
        if (!project) {
          throw new Error("Could not load project.");
        }

        const text = await project.text();
        if (!text) {
          throw new Error("Could not load project text.");
        }

        const json = JSON.parse(text);
        
        const validatorSchema = {
          "name": "string",
          "version": "string",
          "description": "string",
          "objects": "object",
          "options": "object",
        }
        
        for (const [key, type] of Object.entries(validatorSchema)) {
          if (typeof json[key] !== type) {
            this.instructions.debug.log({
              message: `Error loading project: Invalid project schema. Expected '${type}' for key '${key}'.`,
              tags: ["error"],
            });

            throw new Error(`Invalid project schema. Expected '${type}' for key '${key}'.`);
          }
        }

        this.state.project = json;
      },
    },

    [""]: {},
  };
}

export default { VNEngine };
