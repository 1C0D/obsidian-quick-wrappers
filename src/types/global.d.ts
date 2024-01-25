import { Setting } from "obsidian";

declare module "obsidian" {
    interface App {
        setting: Setting,
        // commands: Commands;
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