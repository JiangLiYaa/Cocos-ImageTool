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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCompressSummary = exports.compressImages = exports.collectImagesFromDir = exports.isImageFileName = exports.createImageMatcher = exports.formatReductionRatio = exports.formatBytes = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tinify_1 = __importDefault(require("tinify"));
function formatBytes(bytes) {
    if (bytes < 1024) {
        return `${bytes} Bytes`;
    }
    const kib = bytes / 1024;
    if (kib < 1024) {
        return `${kib.toFixed(2)} KiB`;
    }
    return `${(kib / 1024).toFixed(2)} MiB`;
}
exports.formatBytes = formatBytes;
function formatReductionRatio(before, after) {
    if (before <= 0) {
        return '0%';
    }
    const ratio = ((before - after) / before) * 100;
    return `${ratio.toFixed(2)}%↓`;
}
exports.formatReductionRatio = formatReductionRatio;
function createImageMatcher(regexSource) {
    try {
        return new RegExp(regexSource, 'i');
    }
    catch (_a) {
        return /\.(png|jpg|jpeg|webp)$/i;
    }
}
exports.createImageMatcher = createImageMatcher;
function isImageFileName(fileName, matcher) {
    return matcher.test(fileName);
}
exports.isImageFileName = isImageFileName;
function collectImagesFromDir(dirPath, matcher, minImageSize) {
    const results = [];
    function walk(currentDir) {
        if (!fs.existsSync(currentDir)) {
            return;
        }
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }
            if (!matcher.test(entry.name)) {
                continue;
            }
            const stat = fs.statSync(fullPath);
            if (stat.size >= minImageSize) {
                results.push(fullPath);
            }
        }
    }
    walk(dirPath);
    return results;
}
exports.collectImagesFromDir = collectImagesFromDir;
function compressSingleFile(filePath, apiKey) {
    tinify_1.default.key = apiKey;
    return new Promise((resolve, reject) => {
        tinify_1.default.fromFile(filePath).toFile(filePath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
async function compressImages(filePaths, settings, displayPathMap) {
    var _a;
    if (!settings.apiKey) {
        throw new Error('未配置 Tinify API Key，请在 项目 -> 项目设置 -> cocos-tinify 中填写');
    }
    const summary = {
        total: filePaths.length,
        success: 0,
        failed: 0,
        totalBefore: 0,
        totalAfter: 0,
        items: [],
    };
    const totalBefore = filePaths.reduce((sum, filePath) => {
        if (!fs.existsSync(filePath)) {
            return sum;
        }
        return sum + fs.statSync(filePath).size;
    }, 0);
    console.log(`[cocos-tinify] Find ${filePaths.length} image. Total Size: ${formatBytes(totalBefore)}`);
    console.log('[cocos-tinify] Compression Start ...');
    for (let index = 0; index < filePaths.length; index++) {
        const filePath = filePaths[index];
        const displayPath = (_a = displayPathMap === null || displayPathMap === void 0 ? void 0 : displayPathMap.get(filePath)) !== null && _a !== void 0 ? _a : filePath;
        const beforeSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
        console.log(`[cocos-tinify] [${index + 1}/${filePaths.length}] ${displayPath}`);
        const item = {
            filePath,
            displayPath,
            beforeSize,
            afterSize: beforeSize,
            success: false,
        };
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error('文件不存在');
            }
            await compressSingleFile(filePath, settings.apiKey);
            const afterSize = fs.statSync(filePath).size;
            item.afterSize = afterSize;
            item.success = true;
            summary.success += 1;
            summary.totalBefore += beforeSize;
            summary.totalAfter += afterSize;
            console.log(`[cocos-tinify] Size: ${formatBytes(beforeSize)} -> ${formatBytes(afterSize)}, Reduction Ratio: ${formatReductionRatio(beforeSize, afterSize)}`);
        }
        catch (error) {
            item.success = false;
            item.error = error instanceof Error ? error.message : String(error);
            summary.failed += 1;
            console.error(`[cocos-tinify] Failed: ${displayPath} - ${item.error}`);
        }
        summary.items.push(item);
    }
    summary.compressionCount = tinify_1.default.compressionCount;
    logCompressSummary(summary);
    return summary;
}
exports.compressImages = compressImages;
function logCompressSummary(summary) {
    console.log(`[cocos-tinify] Compression completed. Suc: ${summary.success}, Failed: ${summary.failed}, Total Size Changed: ${formatBytes(summary.totalBefore)} -> ${formatBytes(summary.totalAfter)} Total Reduction Ratio: ${formatReductionRatio(summary.totalBefore, summary.totalAfter)}`);
    if (typeof summary.compressionCount === 'number') {
        console.log(`[cocos-tinify] Compression Count this month: ${summary.compressionCount}`);
    }
}
exports.logCompressSummary = logCompressSummary;
