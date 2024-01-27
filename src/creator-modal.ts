import { Modal, Notice, Setting } from "obsidian";
import QWPlugin from "./main";
import { OnSubmitCallback } from "./types/variables";
import { Wrapper } from "./types/global";
import { generateId } from "./utils";
import { Console } from "./Console";
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
        Console.log("this.editMode", this.editMode)
        Console.log("name, id, tagInput", this.wrapper!.name, this.wrapper!.id, this.wrapper!.tagInput)

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
            .setDesc("Enter @@sel (selection) or @@cb (clipboard) surrounded by the tag. mixed markers and mutilines ok")
            .addTextArea((ta) => {
                ta.setValue(this.wrapper!.tagInput)
                    .onChange(value => {
                        this.wrapper!.tagInput = value;
                    })
                ta.inputEl.setAttr("rows", 4)
                ta.inputEl.setAttr("cols", 30)
            })


        new Setting(this.contentEl)
            .addButton((btn) => {
                btn.setIcon("checkmark")
                    .setCta()
                    .onClick(async () => {
                        const { name, id, tagInput } = this.wrapper!
                        Console.log("this.wrapper!.name", name)
                        Console.log("this.wrapper!.tagInput", tagInput)
                        Console.log("this.wrapper!.id", id)

                        if (!name) {
                            new Notice("Please enter a name.", 2000);
                            return
                        } else if (!tagInput) {
                            new Notice("Please enter a tag.", 2000);
                            return
                        }
                        else {
                            if (this.editMode) {
                                Console.log("ici")
                                this.plugin.settings.wrappers[id].tagInput = tagInput
                                Console.log("nameici", name)
                                Console.log("oldNameici", oldName)
                                if (oldName !== name) {
                                    Console.log("!=")
                                    this.plugin.settings.wrappers[id].name = name
                                    this.plugin.settings.names = names.filter(n => n !== oldName)
                                    this.plugin.settings.names.push(name)

                                }
                            } else {
                                Console.log("là")
                                this.plugin.settings.wrappers[id] = this.wrapper!
                                this.plugin.settings.names.push(this.wrapper!.name)
                                await createCommand(this, id, name, tagInput)
                            }

                            await this.plugin.saveSettings()
                            this.onSubmit(this.wrapper!, this.editMode);
                            Console.log("this.wrapper!", this.wrapper!)
                            this.close();
                        }
                    });
            })
    }
}