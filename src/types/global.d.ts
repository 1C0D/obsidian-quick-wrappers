// declare module "obsidian" {}

interface QWSettings {
    names: string[];
    wrappers: Record<string, Wrapper>;
    runNext: boolean;
}

interface Wrapper {
    id: string;
    name: string;
    tagInput: string;
}