/**
 * @file vn-serializable.ts
 * @fileoverview This file contains the Serializable class, which is used to serialize and deserialize objects to and from JSON.
 * Each class that extends this one must implement their own serialization and deserialization methods.
 * @module vns
 * @license MIT
 * @author mkgiga
 */

export abstract class Serializable {

  /** Takes a JSON string and returns a serializable object. */
  public static fromJSON(json: string): Serializable;

  public static fromJSON(json: string): Serializable {
    throw new Error('Method not implemented.');
  }

  /** Serializes the instance to a JSON string, which may be used to save and load the project. */
  public abstract toJSON(): string;
}

export default { Serializable };