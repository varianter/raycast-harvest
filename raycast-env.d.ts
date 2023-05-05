/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Personal Access Token - Get your token at https://id.getharvest.com/developers */
  "token"?: string,
  /** Harvest Account Id - You'll find this when you create a new Personal Access Token */
  "accountId"?: string,
  /** User-agent - Enable to use unsafe HTTPS for self-signed certificates. */
  "UA": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `harvest-hours` command */
  export type HarvestHours = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `harvest-hours` command */
  export type HarvestHours = {}
}
