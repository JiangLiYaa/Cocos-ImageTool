import * as fs from 'fs';
import * as path from 'path';
import { collectImagesFromDir, compressImages, createImageMatcher } from './compress';
import { PACKAGE_NAME } from './global';
import { readProjectSettingsFromFile } from './settings';

interface BuildPackageOptions {
    enableCompress?: boolean;
    tinifyApiKey?: string;
    imageTypeRegex?: string;
    minImageSize?: number;
}

interface BuildOptions {
    project?: string;
    packages?: Record<string, BuildPackageOptions>;
}

interface BuildResult {
    dest: string;
}

export const throwError = false;

export async function onAfterBuild(options: BuildOptions, result: BuildResult) {
    const packageOptions = options.packages?.[PACKAGE_NAME];
    if (!packageOptions?.enableCompress) {
        return;
    }

    const projectSettings = options.project ? readProjectSettingsFromFile(options.project) : null;
    const apiKey =
        packageOptions.tinifyApiKey ||
        projectSettings?.apiKey ||
        process.env.TINIFY_API_KEY ||
        '';
    const imageTypeRegex =
        packageOptions.imageTypeRegex || projectSettings?.imageTypeRegex || '\\.(png|jpg|jpeg|webp)$';
    const minImageSize = Number(
        packageOptions.minImageSize ?? projectSettings?.minImageSize ?? 0,
    );

    if (!apiKey) {
        console.warn(
            `[${PACKAGE_NAME}] 构建压缩已启用，但未配置 Tinify API Key，请在 项目 -> 项目设置 -> cocos-tinify 中填写`,
        );
        return;
    }

    const outputDir = result.dest;
    if (!outputDir || !fs.existsSync(outputDir)) {
        console.warn(`[${PACKAGE_NAME}] 构建输出目录不存在: ${outputDir}`);
        return;
    }

    const matcher = createImageMatcher(imageTypeRegex);
    const filePaths = collectImagesFromDir(outputDir, matcher, minImageSize);

    if (filePaths.length === 0) {
        console.log(`[${PACKAGE_NAME}] 构建输出目录中未找到可压缩图片: ${outputDir}`);
        return;
    }

    console.log(`[${PACKAGE_NAME}] onAfterBuild compress start: ${path.normalize(outputDir)}`);
    await compressImages(filePaths, { apiKey, imageTypeRegex, minImageSize });
}
