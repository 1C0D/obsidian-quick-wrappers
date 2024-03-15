import { Command, Editor } from "obsidian";
import QWPlugin from "./main";
import wrapperModal from "./creator-modal";
import { Wrapper } from "./types/global";
/* 
improvements: add a way to add icons ?  
*/

export async function createCommand(modal: QWPlugin | wrapperModal, wrapper: Wrapper) {
    const _this = modal instanceof QWPlugin ? modal : modal.plugin
    const command: Command = {
        id: wrapper.id,
        name: "Created command: " + name,
        editorCallback: async (editor: Editor) => await _this.modifyText(editor, wrapper)
    };
    _this.addCommand(command);
}

