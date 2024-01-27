import { Command, Editor } from "obsidian";
import QWPlugin from "./main";
import { Console } from "./Console";
import wrapperModal from "./creator-modal";

export const nothing = "added just to avoid error building plugin"

/* 
improvements: add a way to add icons (list?) svg list ?  
*/

export async function createCommand(modal: QWPlugin | wrapperModal, id: string, name: string, tag: string) {
    const _this = modal instanceof QWPlugin ? modal : modal.plugin
    const command: Command = {
        id: id,
        name: name,
        editorCallback: async (editor: Editor) => await _this.modifyText(editor, tag)
    };
    console.log("command", command)
    console.log("tag", tag);
    _this.addCommand(command);
}

