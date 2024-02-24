import { App, Modal } from "obsidian";
import QWPlugin from "./main";
import { Datepicker } from 'vanillajs-datepicker';
// import { DatepickerOptions } from 'vanillajs-datepicker/Datepicker';


export class DatePicker extends Modal {
    constructor(app: App, public plugin: QWPlugin, public format: string, public cb: (date: string) => void) {
        super(app);
    }

    onOpen() {
        this.modalEl.addClass('date-inserter-modal');

        const { contentEl } = this;

        // Créer l'input
        const inputEl = contentEl.createEl('input');
        inputEl.addClass('invisible-input');
        inputEl.setAttrs({ type: 'text' });

        // Initialiser le datepicker
        const datepicker = new Datepicker(inputEl, {
            autohide: true,
            format: this.format,
            weekStart: 1,
            showOnFocus: true,
        });

        inputEl.addEventListener('hide', () => this.close());
        inputEl.addEventListener('changeDate', () => {
            this.cb(inputEl.value as string);
            setTimeout(() => this.close(), 0);
        });

    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

}