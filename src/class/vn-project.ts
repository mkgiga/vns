
import {
  VNProjectActors,
  VNProjectPlaceDefinition,
  VNProjectScripts,
  VNProjectSignals,
  VNProjectSounds,
  VNProjectPlaces,
} from '@types';

import { Serializable } from './vn-serializable';

export class VNProject extends Serializable {
  name: string;
  version: string;
  description: string;
  authors: string[];
  credits: string;
  license: string;
  mainScene: string;
  actors: VNProjectActors;
  signals: VNProjectSignals;
  sounds: VNProjectSounds;
  places: VNProjectPlaces;
  scripts: VNProjectScripts;

  constructor({
    name,
    version,
    description,
    authors,
    credits,
    license,
    mainScene,
    actors,
    signals,
    sounds,
    places,
    scripts,
  }: {
    name: string;
    version: string;
    description: string;
    authors: string[];
    credits: string;
    license: string;
    mainScene: string;
    actors: VNProjectActors;
    signals: VNProjectSignals;
    sounds: VNProjectSounds;
    places: {
      [placeId: string]: VNProjectPlaceDefinition;
    };
    scripts: {
      [filename: string]: string;
    };
  }) {
    super();
    this.name = name;
    this.version = version;
    this.description = description;
    this.authors = authors;
    this.credits = credits;
    this.license = license;
    this.mainScene = mainScene;
    this.actors = actors;
    this.signals = signals;
    this.sounds = sounds;
    this.places = places;
    this.scripts = scripts;
  }

  static fromJSON(json: string): VNProject {
    const obj = JSON.parse(json);
    return new VNProject(obj);
  }

  toJSON() {
    return JSON.stringify(this);
  }
}

export default { VNProject };