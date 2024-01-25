import QWPlugin from "./main";
import { NewWrapperModal } from "./modal";

export async function getNameAsync(modal: NewWrapperModal | QWPlugin) {
    return new Promise((r) => {
        setTimeout(() => {
            const name = modal.name;
            r(name);
        }, 0);
    });
}