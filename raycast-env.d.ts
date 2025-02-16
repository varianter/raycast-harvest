/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Personal Access Token - Get your token at https://id.getharvest.com/developers */
  "token": string,
  /** Harvest Account Id - You'll find this when you create a new Personal Access Token */
  "accountId": string,
  /** User-agent - Harvest API wants this, so yes, give em a custom User-Agent */
  "UA"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `harvest-hours` command */
  export type HarvestHours = ExtensionPreferences & {}
  /** Preferences accessible in the `harvest-week` command */
  export type HarvestWeek = ExtensionPreferences & {
  /** Display Options - Expected work hours is based on the number of work days from month start up to and including the current date. The difference is displayed next to the registered and total work hours in the navigation title. */
  "displayExpectedHoursDiff"?: boolean
}
}

declare namespace Arguments {
  /** Arguments passed to the `harvest-hours` command */
  export type HarvestHours = {}
  /** Arguments passed to the `harvest-week` command */
  export type HarvestWeek = {}
}
