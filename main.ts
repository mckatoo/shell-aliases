#! /usr/bin/env bun

import { Command } from "commander";
import addAlias from "src/commands/add-alias";
import listAlias from "src/commands/list-alias";
import packageInfo from "./package.json";


const app = new Command()

app
  .name('aliases')
  .description('CLI add alias on .zshrc')
  .version(packageInfo.version)

addAlias(app)
listAlias(app)

app.parse()