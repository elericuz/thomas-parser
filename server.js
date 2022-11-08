'use strict';
import yargs from "yargs";
import dotenv from "dotenv";
import log from "npmlog";
import * as model from "./src/models/model.js"
import * as parser from "./src/controllers/ParserController.js";

// These are to use with VSCODE debugger
log.info = console.log;
log.error = console.error;
log.debug = console.debug;

globalThis.argv = yargs(process.argv.slice(2))
    .option("file", {
        alias: "f",
        type: "string",
        description: "Parse the given file"
    })
    .help()
    .alias("help", "h").argv;

if (!argv.debug) log.pause();

let data = [];
dotenv.config({path: 'settings.env'});
parser.get(argv.file);

if (data.length > 0) {
    if (model.validateData(data)) {
        model.sendObjects(data);
    }
}