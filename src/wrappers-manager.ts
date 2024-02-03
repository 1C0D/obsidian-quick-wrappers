import { Modal, Setting } from "obsidian";
import QWPlugin from "./main";
import wrapperModal from "./creator-modal";
import { sortSettings } from "./utils";
import { wrapperSettings } from "./settings";

export class WrappersManager extends Modal {
    constructor(public plugin: QWPlugin) {
        super(plugin.app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        const { names, wrappers } = this.plugin.settings

        contentEl.createEl("h4", { text: "Wrappers Manager" });

        new Setting(contentEl)
            .setName("Create a New Wrapper")
            .setDesc("Add some @@sel and/or @@cb to include selection or clipboard content. go crazy")
            .addButton(cb => {
                cb.setIcon("plus")
                    .onClick(() => {
                        new wrapperModal(this.plugin, async (wrapper) => {
                            this.onOpen()
                        }).open()
                    })
            })

        sortSettings(this.plugin)

        if (!names.length) return
        for (const name of names) {
            wrapperSettings(this, name, contentEl, wrappers)
        }

    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}