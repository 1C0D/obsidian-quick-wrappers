import { Editor, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import QWPlugin from "./main";
import { instructions } from "./types/variables";

export async function wrapperChooser(_this: QWPlugin, editor: Editor) {
    new CommonSuggest(_this, editor).open()
}

async function justDoIt(_this: QWPlugin, editor: Editor, name: string) {
    const wrappers = _this.settings.wrappers
    const id = Object.values(wrappers).find(
        (wrapper) => wrapper.name === name
    )?.id
    const tag = wrappers[id!]?.tagInput
    if (!tag) return
    await _this.modifyText(editor, tag) // apply the wrapper
}

export class CommonSuggest extends FuzzySuggestModal<string> {
    typed: string
    names: string[]
    constructor(public plugin: QWPlugin, public editor: Editor) {
        super(plugin.app);
        this.init()
    }

    init() {
        this.names = this.plugin.settings.names
        this.setInstructions(instructions)
        this.emptyStateText = "No wrapper found";//herited prop
    }

    getItems(): string[] {
        const inputName = this.inputEl.value;
        if (inputName.length == 0 ) {
            return this.names
        }
        return this.names.filter(name => name.toLowerCase().includes(inputName.toLowerCase()))
    }

    getItemText(item: string): string {
        return item
    }
    onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
        justDoIt(this.plugin, this.editor, item)

    }

    renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement) {
        const wrappers = this.plugin.settings.wrappers
        const id = Object.values(wrappers).find(
            (wrapper) => wrapper.name === item.item
        )?.id
        const tag = wrappers[id!].tagInput

        el.createEl("div", { text: item.item });
        el.createEl("small", { text: tag });
    }

    isMatch(input: string, match: string) {
        return input.toLocaleLowerCase() == match.toLocaleLowerCase()
    }
}