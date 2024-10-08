/**
 * @file types.d.ts
 * @fileoverview This file contains vital type declarations for the .vns scripting engine.
 * @author mkgiga
 * @module vns
 * @license MIT
 */

import { VNContext } from "./class/vn-context";

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

/**
 * Type that defines a set of rules for what lines it can parse and how to parse them.
 */
export type ContextPreprocessingRules = {
  /** The context's first line number. (inclusive) Its first line should always be 1 indent level lower than the next line. */
  y1: number;
  /** The context's last line number. (inclusive) */
  y2: number;
  /** The context's name. */
  name: string;
  /** The context's arguments. */
  args: Object<string, string>;
  /** The context's parent. */
  absoluteIndentLevel: number;
}

/**
 * A dictionary of line numbers and their corresponding context.
 */
export type VNProcessedLabelMap = {
  [lineNumber: number]: VNContext;
}

export type VNFunctionArgument = {
  key: string;
  value: VNValue | undefined;
}

export type VNContextBuilderArgs = {
  
  /** Name of the function's scope. The root scope's name is 'global' and can be referenced by any other scope, no matter how deeply nested. */
  name: string;

  /** The scope's immediate ancestor */
  parent: VNContext | null;

  /** The lines that the context will be responsible for parsing. */
  lines: Array<PreprocessedLine>;
  
  /** 
   * Every context has an absolute base indent level relative to column 0. 
   * This is used to calculate the relative indent level of the context, 
   * so that different indentations may have their own semantic meaning. 
   */
  baseIndentLevel?: number;
  
  /** The line number where the context starts. */
  y1?: number;
  
  /** The line number where the context ends. */
  y2?: number;

  /** Function arguments with optional default values. */
  args?: VNFunctionArgument[];
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
 * This is an internal type used for defining new behavior in the scripting engine so that we can support new instructions.
 */
export abstract class VNInstruction {

  /** The context that called the instruction, akin to 'this' in JavaScript. */
  private caller: VNContext;

  /** Arguments passed to the instruction. */
  private args: { [key: string]: string } = {};

  public constructor(caller: VNContext, args: { [key: string]: string }) {
    this.caller = caller;
    this.args = args;
  }

  public getArgs(): { [key: string]: string } { 
    return this.args;
  }

  public getCaller(): VNContext {
    return this.caller;
  }

  /**
   * If this returns a value, it may be used as an expression in the script.
   */
  public abstract execute(caller: VNContext, args: { [key: string]: string }): any | void;
}

export default {
  Serializable,
  VNInstruction,
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
  VNContextBuilderArgs
}