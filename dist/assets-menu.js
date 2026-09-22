"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAssetMenu = void 0;
const compress_1 = require("./compress");
const settings_1 = require("./settings");
async function getCompressSettings() {
    return (0, settings_1.readProjectSettingsFromEditor)();
}
function isImageAsset(assetInfo, matcher) {
    return !assetInfo.isDirectory && (0, compress_1.isImageFileName)(assetInfo.name, matcher);
}
async function refreshAssets(assetInfos) {
    for (const assetInfo of assetInfos) {
        if (assetInfo.uuid) {
            await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
        }
    }
}
async function compressAssetList(assetInfos) {
    const settings = await getCompressSettings();
    const matcher = (0, compress_1.createImageMatcher)(settings.imageTypeRegex);
    const targets = assetInfos.filter((asset) => isImageAsset(asset, matcher));
    if (targets.length === 0) {
        console.warn('[cocos-tinify] 未找到可压缩的图片');
        return;
    }
    const displayPathMap = new Map();
    for (const asset of targets) {
        displayPathMap.set(asset.file, asset.url);
    }
    await (0, compress_1.compressImages)(targets.map((asset) => asset.file), settings, displayPathMap);
    await refreshAssets(targets);
}
async function compressFolderAsset(assetInfo) {
    const settings = await getCompressSettings();
    const matcher = (0, compress_1.createImageMatcher)(settings.imageTypeRegex);
    const filePaths = (0, compress_1.collectImagesFromDir)(assetInfo.file, matcher, settings.minImageSize);
    if (filePaths.length === 0) {
        console.warn('[cocos-tinify] 文件夹中未找到可压缩的图片');
        return;
    }
    await (0, compress_1.compressImages)(filePaths, settings);
    await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
}
function onAssetMenu(assetInfo) {
    const matcher = /\.(png|jpg|jpeg|webp)$/i;
    return [
        {
            label: 'cocos-tinify',
            submenu: [
                {
                    label: '压缩图片',
                    enabled: isImageAsset(assetInfo, matcher),
                    click() {
                        void compressAssetList([assetInfo]).catch((error) => {
                            console.error('[cocos-tinify]', error);
                        });
                    },
                },
                {
                    label: '压缩文件夹中的图片',
                    enabled: assetInfo.isDirectory,
                    click() {
                        void compressFolderAsset(assetInfo).catch((error) => {
                            console.error('[cocos-tinify]', error);
                        });
                    },
                },
            ],
        },
    ];
}
exports.onAssetMenu = onAssetMenu;
