import { PACKAGE_NAME } from './global';

export function load() {
    console.log(`[${PACKAGE_NAME}] extension loaded`);
}

export function unload() {
    console.log(`[${PACKAGE_NAME}] extension unloaded`);
}
