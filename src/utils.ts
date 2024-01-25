import QSWPlugin from "./main";
import { NewWrapperModal } from "./modal";

export async function getNameAsync(modal: NewWrapperModal | QSWPlugin) {
    return new Promise((r) => {
        setTimeout(() => {
            const name = modal.name;
            r(name);
        }, 0);
    });
}