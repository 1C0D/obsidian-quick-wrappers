import { Modal, Notice, Setting } from "obsidian";
import QWPlugin from "./main";
import { OnSubmitCallback } from "./types/variables";
import { Wrapper } from "./types/global";
import { generateId } from "./utils";
import { createCommand } from "./command-creator";

export default class wrapperModal extends Modal {
    editMode: boolean;
    constructor(public plugin: QWPlugin, public onSubmit: OnSubmitCallback, public wrapper?: Wrapper
    ) {
        super(plugin.app);
        if (wrapper) {
            this.editMode = true;
        } else {
            this.wrapper = { id: generateId(plugin), name: '', tagInput: '' };
            this.editMode = false;
        }
    }

    onOpen() {
        super.onOpen();
        this.display();
    }

    display() {
        const { contentEl: el } = this;
        el.empty();
        this.titleEl.setText(this.editMode ? "Edit wrapper" : "Add a new wrapper")

        const { names } = this.plugin.settings
        const oldName = this.wrapper!.name
        new Setting(el)
            .setName('Wrapper name')
            .addText((txt) => {
                txt.setValue(this.wrapper!.name)
                    .onChange(value => {
                        this.wrapper!.name = value.trim();
                    })
            })

        new Setting(el)
            .setName('Set Tag')
            .setDesc("markers: @@sel→selection, @@cb→clipboard, @@time, @@date, @@(dd MM-DD-YYYY HH:MM:SS)→date/time, @@+(dd MM-DD-YYYY)→date picker")
            .addTextArea((ta) => {
                ta.setValue(this.wrapper!.tagInput)
                    .onChange(value => {
                        this.wrapper!.tagInput = value;
                    })
                ta.inputEl.setAttr("rows", 4)
                ta.inputEl.setAttr("cols", 40)
            })


        new Setting(this.contentEl)
            .addButton((btn) => {
                btn.setIcon("checkmark")
                    .setCta()
                    .onClick(async () => {
                        const { name, id, tagInput } = this.wrapper!
                        if (!name) {
                            new Notice("Please enter a name.", 2000);
                            return
                        } else if (!tagInput) {
                            new Notice("Please enter a tag.", 2000);
                            return
                        }
                        else {
                            if (this.editMode) {
                                this.plugin.settings.wrappers[id].tagInput = tagInput
                                if (oldName !== name) {
                                    this.plugin.settings.wrappers[id].name = name
                                    this.plugin.settings.names = names.filter(n => n !== oldName)
                                    this.plugin.settings.names.push(name)

                                }
                            } else {
                                this.plugin.settings.wrappers[id] = this.wrapper!
                                this.plugin.settings.names.push(this.wrapper!.name)
                                await createCommand(this, this.wrapper!)
                            }

                            await this.plugin.saveSettings()
                            this.onSubmit(this.wrapper!, this.editMode);
                            this.close();
                        }
                    });
            })
    }
}