import QWPlugin from "./main";

export function generateId(_this: QWPlugin): string {
    const prefix = "qw-";
    const timestamp = (Date.now() % 1000000).toString();
    const id = prefix + timestamp;
    if (id in _this.settings.wrappers) {
        return generateId(_this);
    }
    return id
}

export function sortSettings(_this: QWPlugin): void {
    _this.settings.names.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
}