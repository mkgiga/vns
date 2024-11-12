import VisualVNEditor from "../editor.js";
import { VNEngine } from "../../vne.js";

export class UI {

  static init = () => {
    const body = document.body;

    const splash = document.getElementById('splash');
    const splashButtonNew = splash.querySelector('button.splash-new');
    const splashButtonOpen = splash.querySelector('button.splash-open');
    const splashButtonOpenRecent = splash.querySelector('button.splash-open-recent');
    const splashButtonExit = splash.querySelector('button.splash-exit');

    if (splash.hasAttribute('disabled')) {
      splash.remove();
      VisualVNEditor.init();
      UI.toggleAdvancedFeatures();
      UI.show('#editor');  

    } else {
      splashButtonNew.addEventListener('click', () => {
        this.animate.fadeOut({
          target: splash,
          duration: 500,
        }).onfinish = () => {
          splash.remove();
  
          VisualVNEditor.init();
          UI.toggleAdvancedFeatures();
          UI.show('#editor');  
        };
      });
    }
    
    const resourcesPanel = document.getElementById('project-resources');
    const resourcesProjectActors = document.getElementById('resources-project-actors');

    const projectResourcesButtons = document.querySelectorAll('[id^=btn-project-]');
    for (const button of projectResourcesButtons) {
      button.addEventListener('click', () => {
        if (resourcesPanel.hasAttribute('collapsed')) {
          resourcesPanel.removeAttribute('collapsed');
        }
      });
    }
    
  }

  static animate = {
    shake: ({
      target = document.body,
      duration = 500,
      distance = 10,
    }) => {
      const now = Date.now();
      let dt = 0;

      const shakeElement = () => {
        dt = Date.now() - now;
        if (dt < duration) {
          const x = Math.sin(dt / duration * Math.PI) * distance;
          target.style.transform = `translateX(${x}px)`;
          requestAnimationFrame(shakeElement);
        } else {
          target.style.transform = '';
        }
      };

      shakeElement();
    },

    fadeOut: ({
      target = document.body,
      duration = 500,
    }) => {
      return target.animate([
        { opacity: 1 },
        { opacity: 0 },
      ], {
        duration,
        fill: 'forwards',
      });
    },
  }

  toggleResourcesPanel() {
    const resourcesPanel = document.getElementById('project-resources');
    resourcesPanel.toggleAttribute('collapsed');
  }

  static toggleAdvancedFeatures() {
    const advancedFeatures = document.querySelectorAll('[advanced-feature]');
    for (const feature of advancedFeatures) {
      feature.toggleAttribute('hidden');
    }
  }

  static hide(element) {
    if (element instanceof HTMLElement) {
      element.setAttribute('hidden', '');
      return element;
    }

    if (typeof element === 'string') {
      const el = document.querySelector(element);

      if (el) {
        el.setAttribute('hidden', '');
        return el;
      }

      throw new Error(`Element "${element}" not found.`);
    }
    
    throw new Error('Wrong type of argument. Expected HTMLElement or string.');
  }

  static show(element) {
    if (element instanceof HTMLElement) {
      element.removeAttribute('hidden');
      return element;
    }

    if (typeof element === 'string') {
      const el = document.querySelector(element);

      if (el) {
        el.removeAttribute('hidden');
        return el;
      }

      throw new Error(`Element "${element}" not found.`);
    }
    
    throw new Error('Wrong type of argument. Expected HTMLElement or string.');
  }

  
}

export default UI;