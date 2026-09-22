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
exports.onAfterBuild = exports.throwError = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const compress_1 = require("./compress");
const global_1 = require("./global");
const settings_1 = require("./settings");
exports.throwError = false;
async function onAfterBuild(options, result) {
    var _a, _b, _c;
    const packageOptions = (_a = options.packages) === null || _a === void 0 ? void 0 : _a[global_1.PACKAGE_NAME];
    if (!(packageOptions === null || packageOptions === void 0 ? void 0 : packageOptions.enableCompress)) {
        return;
    }
    const projectSettings = options.project ? (0, settings_1.readProjectSettingsFromFile)(options.project) : null;
    const apiKey = packageOptions.tinifyApiKey ||
        (projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.apiKey) ||
        process.env.TINIFY_API_KEY ||
        '';
    const imageTypeRegex = packageOptions.imageTypeRegex || (projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.imageTypeRegex) || '\\.(png|jpg|jpeg|webp)$';
    const minImageSize = Number((_c = (_b = packageOptions.minImageSize) !== null && _b !== void 0 ? _b : projectSettings === null || projectSettings === void 0 ? void 0 : projectSettings.minImageSize) !== null && _c !== void 0 ? _c : 0);
    if (!apiKey) {
        console.warn(`[${global_1.PACKAGE_NAME}] 构建压缩已启用，但未配置 Tinify API Key，请在 项目 -> 项目设置 -> cocos-tinify 中填写`);
        return;
    }
    const outputDir = result.dest;
    if (!outputDir || !fs.existsSync(outputDir)) {
        console.warn(`[${global_1.PACKAGE_NAME}] 构建输出目录不存在: ${outputDir}`);
        return;
    }
    const matcher = (0, compress_1.createImageMatcher)(imageTypeRegex);
    const filePaths = (0, compress_1.collectImagesFromDir)(outputDir, matcher, minImageSize);
    if (filePaths.length === 0) {
        console.log(`[${global_1.PACKAGE_NAME}] 构建输出目录中未找到可压缩图片: ${outputDir}`);
        return;
    }
    console.log(`[${global_1.PACKAGE_NAME}] onAfterBuild compress start: ${path.normalize(outputDir)}`);
    await (0, compress_1.compressImages)(filePaths, { apiKey, imageTypeRegex, minImageSize });
}
exports.onAfterBuild = onAfterBuild;
