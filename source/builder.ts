import { PACKAGE_NAME } from './global';

export const configs: Record<string, unknown> = {
    '*': {
        hooks: './hooks',
        options: {
            enableCompress: {
                label: '启用图片压缩',
                description: '构建完成后自动压缩输出目录中的图片',
                default: false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
            tinifyApiKey: {
                label: 'TinifyAPIKey',
                description: 'TinyPNG API Key，留空则使用项目设置中的 Key',
                default: '',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'https://tinypng.com/developers',
                    },
                },
            },
            imageTypeRegex: {
                label: '期望压缩的图片类型（正则表达式）',
                default: '\\.(png|jpg|jpeg|webp)$',
                render: {
                    ui: 'ui-input',
                },
            },
            minImageSize: {
                label: '期望压缩的图片最小大小（字节）',
                default: 0,
                render: {
                    ui: 'ui-num-input',
                },
            },
        },
    },
};

export function load() {
    console.log(`[${PACKAGE_NAME}] builder load`);
}

export function unload() {
    console.log(`[${PACKAGE_NAME}] builder unload`);
}
