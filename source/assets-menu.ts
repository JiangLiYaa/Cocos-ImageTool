import {
    collectImagesFromDir,
    compressImages,
    createImageMatcher,
    isImageFileName,
} from './compress';
import { readProjectSettingsFromEditor } from './settings';

declare const Editor: any;

interface AssetInfo {
    name: string;
    file: string;
    url: string;
    uuid: string;
    isDirectory: boolean;
}

async function getCompressSettings() {
    return readProjectSettingsFromEditor();
}

function isImageAsset(assetInfo: AssetInfo, matcher: RegExp): boolean {
    return !assetInfo.isDirectory && isImageFileName(assetInfo.name, matcher);
}

async function refreshAssets(assetInfos: AssetInfo[]) {
    for (const assetInfo of assetInfos) {
        if (assetInfo.uuid) {
            await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
        }
    }
}

async function compressAssetList(assetInfos: AssetInfo[]) {
    const settings = await getCompressSettings();
    const matcher = createImageMatcher(settings.imageTypeRegex);
    const targets = assetInfos.filter((asset) => isImageAsset(asset, matcher));

    if (targets.length === 0) {
        console.warn('[cocos-tinify] 未找到可压缩的图片');
        return;
    }

    const displayPathMap = new Map<string, string>();
    for (const asset of targets) {
        displayPathMap.set(asset.file, asset.url);
    }

    await compressImages(
        targets.map((asset) => asset.file),
        settings,
        displayPathMap,
    );
    await refreshAssets(targets);
}

async function compressFolderAsset(assetInfo: AssetInfo) {
    const settings = await getCompressSettings();
    const matcher = createImageMatcher(settings.imageTypeRegex);
    const filePaths = collectImagesFromDir(assetInfo.file, matcher, settings.minImageSize);

    if (filePaths.length === 0) {
        console.warn('[cocos-tinify] 文件夹中未找到可压缩的图片');
        return;
    }

    await compressImages(filePaths, settings);
    await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
}

export function onAssetMenu(assetInfo: AssetInfo) {
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
