export const nothing = "added just to avoid error building plugin"

/* 
toSee: si un wrapper est remove removeCommand quand ?


improvements: add a way to add icons (list?) svg list ? commander plugin help ? to see...
ajout id to names[] ? to simplify access ? doesn't seem better

*/



//////////////////////////////////////////////// code


// createCommand(commandName: string) {
//     const command: Command = {
//         id: ``,
//         name: `Toggle`,
//         editorCallback: (editor: Editor) => ),
//     };
//     this.addCommand(command);
// }


//////////////////////////////////////////////// end code

/* example command

this.addCommand({
    id: 'sample-editor-command',
    name: 'Sample editor command',
    editorCallback: (editor: Editor, view: MarkdownView) => {
        console.log(editor.getSelection());
        editor.replaceSelection('Sample Editor Command');
    }
}); 
*/

/* code references summary


NewWrapperModal

interface QWSettings {
    names: string[];
    wrappers: Record<string, Wrapper>;
    runNext: boolean;
}

interface Wrapper {
    id: string;
    name: string;
    tagInput: string;
}

*/

