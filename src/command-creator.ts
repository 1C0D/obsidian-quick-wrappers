import { Command, Editor } from "obsidian";
import QWPlugin from "./main";
import { NewWrapperModal } from "./modal";

export const nothing = "added just to avoid error building plugin"

/* 
improvements: add a way to add icons (list?) svg list ? commander plugin help ? to see...

*/

export async function createCommand(modal: NewWrapperModal | QWPlugin, id: string, name: string, tag: string) {
    const _this = modal instanceof QWPlugin ? modal : modal.plugin
    console.log("id", id)
    console.log("name", name)
    console.log("tag", tag)

    const command: Command = {
        id: id,
        name: name,
        editorCallback: async (editor: Editor) => await _this.modifyText(editor, tag)
    };
    _this.addCommand(command);
}

