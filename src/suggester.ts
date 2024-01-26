import { App, FuzzyMatch, FuzzySuggestModal, Notice } from "obsidian";
import { NewWrapperModal } from "./modal";
import QWPlugin from "./main";

const instructions = [
    { command: '↑↓', purpose: 'to navigate' },
    { command: '↵ or click', purpose: 'to validate' },
    { command: 'esc', purpose: 'to dismiss' }
];


export class CommonSuggest extends FuzzySuggestModal<string> {
    typed: string
    names: string[]
    constructor(app: App, public modal: NewWrapperModal | QWPlugin) {
        super(app);
        this.init()
    }

    init() {
        this.names = this.modal instanceof QWPlugin ? this.modal.settings.names : this.modal.plugin.settings.names
        this.setPlaceholder("New name to create wrapper else edit existing one.")
        this.setInstructions(instructions)
        this.emptyStateText = "Enter a new name";//herited prop
    }

    getItems(): string[] {
        const inputName = this.inputEl.value;
        if (inputName.length == 0 || this.names.filter(name => this.isMatch(name, inputName)).length > 0) return this.names
        this.names = [inputName]
        return this.names
    }

    getItemText(item: string): string {
        return item
    }
    onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
        new Notice(`Selected ${item}`);
        if (this.modal instanceof NewWrapperModal) {
            this.modal.nameInput.setValue(item)
        }
        this.modal.name = item
    }

    renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement) {
        const wrappers = this.modal instanceof QWPlugin ? this.modal.settings.wrappers : this.modal.plugin.settings.wrappers
        const id = Object.values(wrappers).find(
            (wrapper) => wrapper.name === item.item
        )?.id
        const tag = wrappers[id!]?.tagInput || ""

        console.log("item.item", item.item)
        el.createEl("div", { text: item.item });
        el.createEl("small", { text: tag });
    }

    isMatch(input: string, match: string) {
        return input.toLocaleLowerCase() == match.toLocaleLowerCase()
    }

    onClose(): void {
        if (this.modal instanceof NewWrapperModal)
            this.modal.onOpen()
    }
}