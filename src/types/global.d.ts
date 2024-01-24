// declare module "obsidian" {}

interface QSWSettings {
    names: string[];
    wrappers: Record<string, Wrapper>;
    runNext: boolean;
}

interface Wrapper {
    id: string;
    name: string;
    tagInput: string;
}