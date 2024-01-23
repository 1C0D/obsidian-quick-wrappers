// declare module "obsidian" {}

interface QSWSettings {
    wrappers: Record <string, Wrapper>;
}

interface Wrapper {
    id: string;
    name: string;
    startTag: string;
    endTag: string;
}