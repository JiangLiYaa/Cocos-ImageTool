import * as fs from 'fs';
import * as path from 'path';
import type { CompressSettings } from './compress';
import { PACKAGE_NAME } from './global';

export const DEFAULT_IMAGE_REGEX = '\\.(png|jpg|jpeg|webp)$';

export function readProjectSettingsFromFile(projectPath: string): CompressSettings {
    const settingsPath = path.join(projectPath, 'settings', 'v2', 'extensions', `${PACKAGE_NAME}.json`);
    let apiKey = '';
    let imageTypeRegex = DEFAULT_IMAGE_REGEX;
    let minImageSize = 0;

    if (fs.existsSync(settingsPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
            apiKey = data.tinifyApiKey || '';
            imageTypeRegex = data.imageTypeRegex || DEFAULT_IMAGE_REGEX;
            minImageSize = Number(data.minImageSize || 0);
        } catch {
            // ignore invalid settings file
        }
    }

    return { apiKey, imageTypeRegex, minImageSize };
}

export async function readProjectSettingsFromEditor(): Promise<CompressSettings> {
    // assets-menu 运行在编辑器进程，可直接使用 Editor API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (globalThis as any).Editor;
    if (!editor?.Profile?.getProject) {
        return { apiKey: '', imageTypeRegex: DEFAULT_IMAGE_REGEX, minImageSize: 0 };
    }

    const apiKey = (await editor.Profile.getProject(PACKAGE_NAME, 'tinifyApiKey')) || '';
    const imageTypeRegex =
        (await editor.Profile.getProject(PACKAGE_NAME, 'imageTypeRegex')) || DEFAULT_IMAGE_REGEX;
    const minImageSize = Number((await editor.Profile.getProject(PACKAGE_NAME, 'minImageSize')) || 0);
    return { apiKey, imageTypeRegex, minImageSize };
}
