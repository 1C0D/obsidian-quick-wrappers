import QWPlugin from "./main";
import { NewWrapperModal } from "./modal";

export async function getNameAsync(modal: NewWrapperModal | QWPlugin):Promise<string> {
    return new Promise((r) => {
        setTimeout(() => {
            const name = modal.name;
            r(name);
        }, 0);
    });
}

export async function getLengthAsync(modal:  QWPlugin): Promise<number> {
    return new Promise((r) => {
        setTimeout(() => {
            const length = modal.length;
            r(length);
        }, 0);
    });
}