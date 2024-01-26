import { Command, Editor } from "obsidian";
import QWPlugin from "./main";
import { Console } from "./Console";

export const nothing = "added just to avoid error building plugin"

/* 
improvements: add a way to add icons (list?) svg list ? commander plugin help ? to see...

*/

export async function createCommand(modal: QWPlugin, id: string, name: string, tag: string) {

    const command: Command = {
        id: id,
        name: name,
        editorCallback: async (editor: Editor) => await modal.modifyText(editor, tag)
    };
    modal.addCommand(command);
}

