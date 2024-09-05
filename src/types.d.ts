

export abstract class Serializable {
  /** Takes a JSON string and returns a serializable object. */
  static fromJSON(json: string): Serializable;

  /** Serializes the instance to a JSON string, which may be used to save and load the project. */
  toJSON(): string;
}

export type VNProjectActorBodyPart = {
  [variant: string]: string;
};

export type VNProjectActorBody = {
  [bodyPart: string]: VNProjectActorBodyPart;
};

export type VNProjectActorDefinition = {
  name: string;
  description: string;
  color: string;
  body: VNProjectActorBody;
  default: {
    body: VNProjectActorBody;
  };
  aliases: string[];
};

export type VNProjectPlaceDefinition = {
  name: string;
  description: string;
  background: string;
  foreground: string;
  theme: string;
  zoom: number;
};

export type VNProjectActors = {
  [actorId: string]: VNProjectActorDefinition;
};

export type VNProjectSignals = {
  [signalId: string]: {
    command: string;
  };
};

export type VNProjectSounds = {
  [audioId: string]: string;
};

export type VNProjectPlaces = {
  [placeId: string]: {
    name: string;
    description: string;
    background: string;
    foreground: string;
    theme: string;
    zoom: number;
  };
};

export type VNProjectScripts = {
  [filename: string]: string;
};

/**
 * A visual novel project data structure that contains all runtime-critical data
 * for a visual novel project to function.
 *
 * The aim is to have a single data structure that can be fed into a visual novel player element
 * to render the visual novel immediately without any additional configuration.
 * 
 */
export interface VNProject {

  /** The name of the visual novel project. */
  name: string = "Untitled Visual Novel";

  /** The version of the visual novel project. Does not have to follow a specific format. ie '1.0.0' or '1' or '1.0alpha'. */
  version: string = "1.0.0";

  /** A brief description of the visual novel project. */
  description: string;

  /** The authors of the visual novel. May have one or more authors, but will always be an array. */
  authors: string[] = ["Anonymous"];

  /** Who to credit for the visual novel. */
  credits: string;

  /** The license of the visual novel project as set by the author(s). */
  license: string = "None";

  /** The main scene to start the visual novel from. */
  mainScene: string = "start";
  
  /** A list of all the scene scripts in the visual novel project. */
  scripts: VNProjectScripts;

  /** A list of all the sounds in the visual novel project. */
  places: VNProjectPlaces;

  /** A list of all the audio files in the visual novel project. */
  actors: VNProjectActors;

  /** A list of all emittable signals (that change the state of something in the scene). */
  signals: VNProjectSignals;

  
};

export type VNValue =
  | string
  | { [key: string]: VNValue }
  | boolean
  | object
  | Array<VNValue>
  | null
  | number
  | undefined;

export type GlobalProjects = {
  [projectId: string]: VNProject;
};

export type HTMLVNScriptElementOptions = {
  indentSize: number = 2;
  debugLevel: number = 0;
}

export type PreprocessedLine = {
  /** Indent level. */
  t: number;
  /** Line number. */
  y: number;
  /** Text content (trimmed). */
  line: string;
  /** Reference to all of the lines that are being parsed. */
  allLines: PreprocessedLine[];
}

export type VNFunctionArgument = {
  key: string;
  value: VNValue | undefined;
}

/**
 * Object that keeps track of where all double-quoted strings are stored in the script for later parsing.
 */
export type ParserStringMap = {
  [lineNumber: number]: {
    start: number;
    end: number;
    value: string;
  };

  /** The total number of strings in the script. */
  count: number;
}

/**
 * Contains a reference to the context in which the instruction was called,
 * arguments passed to the instruction, and a callback function to execute.
 * 
 * The callback function is responsible for resolving any unresolved argument values.
 */
export type VNInstruction = {
  caller: VNContext;
  args: { [key: string]: string };
  callback: (caller: VNContext, args: { [key: string]: string }) => void;
}

export default {
  Serializable,
  VNProject,
  VNProjectActorBodyPart,
  VNProjectActorBody,
  VNProjectActorDefinition,
  VNProjectActors,
  VNProjectPlaceDefinition,
  VNProjectPlaces,
  VNProjectScripts,
  VNProjectSignals,
  VNProjectSounds,
  VNValue,
  GlobalProjects,
  HTMLVNScriptElementOptions,
  PreprocessedLine,
  VNFunctionArgument,
  ParserStringMap,
  VNInstruction,
}