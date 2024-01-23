import { App, FuzzySuggestModal, Notice } from "obsidian";
import { NewWrapperModal } from "./modal";

const instructions = [
    { command: '↑↓', purpose: 'to navigate' },
    { command: '↵ or click', purpose: 'to validate' },
    { command: 'esc', purpose: 'to dismiss' }
];

export class CommonSuggest extends FuzzySuggestModal<string> {
    typed: string
    names: string[]
    constructor(app: App, public modal: NewWrapperModal) {
        super(app);
        this.init()
    }

    init() {
        this.names = this.modal.plugin.settings.names
        this.setPlaceholder("Enter a new tag name to create or select one to modify")
        this.setInstructions(instructions)
        this.emptyStateText = "Enter a new name";
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
        this.modal.nameInput.setValue(item)
        this.modal.name = item
    }

    isMatch(input: string, match: string) {
        return input.toLocaleLowerCase() == match.toLocaleLowerCase()
    }

    onClose(): void {
        this.modal.onOpen()
    }
}