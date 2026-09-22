"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = void 0;
const global_1 = require("./global");
function load() {
    console.log(`[${global_1.PACKAGE_NAME}] extension loaded`);
}
exports.load = load;
function unload() {
    console.log(`[${global_1.PACKAGE_NAME}] extension unloaded`);
}
exports.unload = unload;
