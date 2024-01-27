import { QWSettings, Wrapper } from "./global";

export type OnSubmitCallback = (wrapper: Wrapper, editMode: boolean) => void

export const DEFAULT_SETTINGS: QWSettings = {
    names: [],
    wrappers: {},
    // runNext: true,
    // openHK: true,

}


export const instructions = [
    { command: '↑↓', purpose: 'to navigate' },
    { command: '↵ or click', purpose: 'to validate' },
    { command: 'esc', purpose: 'to dismiss' }
];