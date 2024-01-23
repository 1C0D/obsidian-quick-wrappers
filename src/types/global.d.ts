// declare module "obsidian" {}

interface QSWSettings {
    names: string[];
    wrappers: Record<string, Wrapper>;
}

interface Wrapper {
    id: string;
    name: string;
    startTagInput: string;
    endTagInput: string;
}