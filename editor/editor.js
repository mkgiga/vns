import { VNEngine } from '../vne.js';
import UI from './lib/ui.js';

export class VisualVNEditor {

  static rootElement = document.querySelector('#editor');
  static playerContainer = null;
  static previewPlayerEngine = null;
  static templates = {};

  static init() {
    const playerContainer = document.querySelector('#vn-preview-player-container');
    
    console.log(playerContainer);

    let templates = {
      ...VisualVNEditor.initTemplates(),
    }

    VisualVNEditor.previewPlayerEngine = new VNEngine({
      sceneHost: playerContainer,
      script: [],
      autoRun: false,
    });
  }

  static initTemplates() {
    const templateElements = document.querySelectorAll('template');

    for (const template of templateElements) {
      const templateId = template.getAttribute('id');
      VisualVNEditor.templates[templateId] = template;
    }
  }

  static createSceneEditor({
    name = 'Untitled Scene',
    events = [],
  }) {
    const sceneEditor = VisualVNEditor.templates['scene-editor'].content.cloneNode(true);

    const sceneEditorName = sceneEditor.querySelector('.scene-editor-name');
    sceneEditorName.textContent = name;

    const sceneEditorEvents = sceneEditor.querySelector('.scene-editor-events');

    for (const event of events) {
      const eventElement = VisualVNEditor.createEventEditor(event);
      sceneEditorEvents.appendChild(eventElement);
    }

    return sceneEditor;
  }

  static initShortcuts() {

  }
}

document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});

export default VisualVNEditor;