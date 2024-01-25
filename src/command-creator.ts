import { Command, Editor } from "obsidian";
import QWPlugin from "./main";
import { NewWrapperModal } from "./modal";
import { Console } from "./Console";

export const nothing = "added just to avoid error building plugin"

/* 
improvements: add a way to add icons (list?) svg list ? commander plugin help ? to see...

*/

export async function createCommand(modal: NewWrapperModal | QWPlugin, id: string, name: string, tag: string) {
    const _this = modal instanceof QWPlugin ? modal : modal.plugin
    Console.log("id", id)
    Console.log("name", name)
    Console.log("tag", tag)

    const command: Command = {
        id: id,
        name: name,
        editorCallback: async (editor: Editor) => await _this.modifyText(editor, tag)
    };
    _this.addCommand(command);
}

