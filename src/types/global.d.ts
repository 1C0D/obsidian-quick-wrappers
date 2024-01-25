import { Setting } from "obsidian";

declare module "obsidian" {
    interface App {
        setting: Setting,
        commands: Commands;
        registerCommands: () => void;
        hotkeyManager: HotkeyManager;
    }

    interface HotkeyManager {
        getHotkeys: (command: string) => KeymapInfo[];
        removeHotkeys: (command: string) => void;
    }

    interface Commands { 
        removeCommand: (commandId: string) => void;
        commands: Record<string, Command>;
        editorCommands: Record<string, Command>;
    }

    interface Setting extends Modal { 
        openTabById: (id: string) => Record<string, any>; 
        activeTab: Record<string, any>;
    }
}

interface QWSettings {
    names: string[];
    wrappers: Record<string, Wrapper>;
    runNext: boolean;
    openHK: boolean;
}

interface Wrapper {
    id: string;
    name: string;
    tagInput: string;
}