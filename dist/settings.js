"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readProjectSettingsFromEditor = exports.readProjectSettingsFromFile = exports.DEFAULT_IMAGE_REGEX = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const global_1 = require("./global");
exports.DEFAULT_IMAGE_REGEX = '\\.(png|jpg|jpeg|webp)$';
function readProjectSettingsFromFile(projectPath) {
    const settingsPath = path.join(projectPath, 'settings', 'v2', 'extensions', `${global_1.PACKAGE_NAME}.json`);
    let apiKey = '';
    let imageTypeRegex = exports.DEFAULT_IMAGE_REGEX;
    let minImageSize = 0;
    if (fs.existsSync(settingsPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            apiKey = data.tinifyApiKey || '';
            imageTypeRegex = data.imageTypeRegex || exports.DEFAULT_IMAGE_REGEX;
            minImageSize = Number(data.minImageSize || 0);
        }
        catch (_a) {
            // ignore invalid settings file
        }
    }
    return { apiKey, imageTypeRegex, minImageSize };
}
exports.readProjectSettingsFromFile = readProjectSettingsFromFile;
async function readProjectSettingsFromEditor() {
    var _a;
    // assets-menu 运行在编辑器进程，可直接使用 Editor API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = globalThis.Editor;
    if (!((_a = editor === null || editor === void 0 ? void 0 : editor.Profile) === null || _a === void 0 ? void 0 : _a.getProject)) {
        return { apiKey: '', imageTypeRegex: exports.DEFAULT_IMAGE_REGEX, minImageSize: 0 };
    }
    const apiKey = (await editor.Profile.getProject(global_1.PACKAGE_NAME, 'tinifyApiKey')) || '';
    const imageTypeRegex = (await editor.Profile.getProject(global_1.PACKAGE_NAME, 'imageTypeRegex')) || exports.DEFAULT_IMAGE_REGEX;
    const minImageSize = Number((await editor.Profile.getProject(global_1.PACKAGE_NAME, 'minImageSize')) || 0);
    return { apiKey, imageTypeRegex, minImageSize };
}
exports.readProjectSettingsFromEditor = readProjectSettingsFromEditor;
