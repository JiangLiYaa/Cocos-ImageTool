import * as fs from 'fs';
import * as path from 'path';
import tinify from 'tinify';

export interface CompressSettings {
    apiKey: string;
    imageTypeRegex: string;
    minImageSize: number;
}

export interface CompressItemResult {
    filePath: string;
    displayPath: string;
    beforeSize: number;
    afterSize: number;
    success: boolean;
    error?: string;
}

export interface CompressSummary {
    total: number;
    success: number;
    failed: number;
    totalBefore: number;
    totalAfter: number;
    items: CompressItemResult[];
    compressionCount?: number;
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} Bytes`;
    }
    const kib = bytes / 1024;
    if (kib < 1024) {
        return `${kib.toFixed(2)} KiB`;
    }
    return `${(kib / 1024).toFixed(2)} MiB`;
}

export function formatReductionRatio(before: number, after: number): string {
    if (before <= 0) {
        return '0%';
    }
    const ratio = ((before - after) / before) * 100;
    return `${ratio.toFixed(2)}%↓`;
}

export function createImageMatcher(regexSource: string): RegExp {
    try {
        return new RegExp(regexSource, 'i');
    } catch {
        return /\.(png|jpg|jpeg|webp)$/i;
    }
}

export function isImageFileName(fileName: string, matcher: RegExp): boolean {
    return matcher.test(fileName);
}

export function collectImagesFromDir(
    dirPath: string,
    matcher: RegExp,
    minImageSize: number,
): string[] {
    const results: string[] = [];

    function walk(currentDir: string) {
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

function compressSingleFile(filePath: string, apiKey: string): Promise<void> {
    tinify.key = apiKey;
    return new Promise((resolve, reject) => {
        tinify.fromFile(filePath).toFile(filePath, (err: Error | null) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

export async function compressImages(
    filePaths: string[],
    settings: CompressSettings,
    displayPathMap?: Map<string, string>,
): Promise<CompressSummary> {
    if (!settings.apiKey) {
        throw new Error('未配置 Tinify API Key，请在 项目 -> 项目设置 -> cocos-tinify 中填写');
    }

    const summary: CompressSummary = {
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
        const displayPath = displayPathMap?.get(filePath) ?? filePath;
        const beforeSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;

        console.log(`[cocos-tinify] [${index + 1}/${filePaths.length}] ${displayPath}`);

        const item: CompressItemResult = {
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
            console.log(
                `[cocos-tinify] Size: ${formatBytes(beforeSize)} -> ${formatBytes(afterSize)}, Reduction Ratio: ${formatReductionRatio(beforeSize, afterSize)}`,
            );
        } catch (error) {
            item.success = false;
            item.error = error instanceof Error ? error.message : String(error);
            summary.failed += 1;
            console.error(`[cocos-tinify] Failed: ${displayPath} - ${item.error}`);
        }

        summary.items.push(item);
    }

    summary.compressionCount = tinify.compressionCount;
    logCompressSummary(summary);
    return summary;
}

export function logCompressSummary(summary: CompressSummary) {
    console.log(
        `[cocos-tinify] Compression completed. Suc: ${summary.success}, Failed: ${summary.failed}, Total Size Changed: ${formatBytes(summary.totalBefore)} -> ${formatBytes(summary.totalAfter)} Total Reduction Ratio: ${formatReductionRatio(summary.totalBefore, summary.totalAfter)}`,
    );
    if (typeof summary.compressionCount === 'number') {
        console.log(`[cocos-tinify] Compression Count this month: ${summary.compressionCount}`);
    }
}
