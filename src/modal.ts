import { App, Modal, Notice, Setting, TextComponent } from "obsidian";
import QSWPlugin from "./main";
import { CommonSuggest } from "./suggester";
import { getNameAsync } from "./utils";

type OnSubmitCallback = (name: string, tag: string) => void

export class NewWrapperModal extends Modal {
	name: string
	tag: string
	inputEl: HTMLInputElement
	suggester: CommonSuggest
	nameInput: TextComponent

	constructor(app: App, public plugin: QSWPlugin, public onSubmit: OnSubmitCallback,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h1", { text: "Create/Edit a wrapper" });

		new Setting(contentEl)
			.setName("Tag Name")
			.setDesc("click in the text input to create or choose an existing wrapper")
			.addText(text => {
				this.inputEl = text.inputEl
				if (this.name) text.setValue(this.name) // if we do onOpen()
				this.nameInput = text  // used in the fuzzy suggester
				this.inputEl.onfocus = () => {
					this.suggester.open();
				}
			})

			//TODO: ask for confirmation on delete 
			.addButton((b) => {
				b
					.setIcon("trash-2")
					.onClick(async () => {
						this.plugin.settings.names = this.plugin.settings.names.filter(n => n !== this.name)
						const id = Object.values(this.plugin.settings.wrappers).find(
							(wrapper) => wrapper.name === this.name
						)?.id
						delete this.plugin.settings.wrappers[id!]
						this.nameInput.setValue("")
						this.name = ""
						this.tag = ""
						this.onOpen();
						await this.plugin.saveSettings()
					})
			})

		this.suggester = new CommonSuggest(this.app, this);


		new Setting(contentEl)
			.setName("Tag")
			.setDesc("Enter @SEL (selection) or @CLIPB (clipboard) surrounded by the tag. mixed markers and mutilines are ok")
			.addTextArea(async text => {
				let setTag = ""
				const name = await getNameAsync(this); // this.name undefined without a delay

				//to prefill the tag if exists
				for (const wrap of Object.values(this.plugin.settings.wrappers)) {
					if (wrap.name === name) {
						if (wrap.tagInput) {
							setTag = wrap.tagInput
							this.tag = setTag
						}
						break
					};
				}
				text
					.setPlaceholder("```js\n@SEL\n```")
					.setValue(setTag)
					.onChange(async (value) => {
						this.tag = value;
					})
				text.inputEl.setAttr("rows", 4)
				text.inputEl.setAttr("cols", 30)
			})

		checkbox(this, contentEl, "Apply tag on document on confirm")

		new Setting(this.contentEl)
			.addButton((b) => {
				b.setIcon("checkmark")
					.setCta()
					.onClick(() => {
						if (!this.name || !this.tag) { // more conditions to add later
							new Notice("Please enter a name.", 2000);
						}
						else {
							this.onSubmit(this.name, this.tag);
							this.close();
						}
					});
			})
	}


	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}


const checkbox = (
	modal: NewWrapperModal,
	contentEl: HTMLElement,
	text: string,
) => {
	const { plugin } = modal;
	const { settings } = plugin;

	contentEl.createDiv({ text: text, cls: "qsw-checkbox-cont" }, (el) => {
		el.createEl("input",
			{
				attr: {
					cls: "qsw-checkbox",
					type: "checkbox",
					checked: settings.runNext
				}
			}, (checkbox) => {
				checkbox
					.checked = settings.runNext
				checkbox.onchange = () => {
					settings.runNext = checkbox.checked
					plugin.saveSettings()
					modal.onOpen()
				}
			})
	});
}


type ConfirmCallback = (confirmed: boolean) => void;

// https://github.com/eoureo/obsidian-runjs/blob/master/src/confirm_modal.ts#L51
class ConfirmModal extends Modal {
	constructor(
		app: App,
		public message: string,
		public callback: ConfirmCallback,
		public width?: number,
		public height?: number
	) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		if (this.width) {
			this.modalEl.style.width = `${this.width}px`;
		}

		if (this.height) {
			this.modalEl.style.height = `${this.height}px`;
		}

		contentEl.createEl("p").setText(this.message);

		new Setting(this.contentEl)
			.addButton((b) => {
				b.setIcon("checkmark")
					.setCta()
					.onClick(() => {
						this.callback(true);
						this.close();
					});
			})
			.addExtraButton((b) =>
				b.setIcon("cross").onClick(() => {
					this.callback(false);
					this.close();
				})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

async function openConfirmModal(
	app: App,
	message: string,
	width?: number,
	height?: number
): Promise<boolean> {
	return await new Promise((resolve) => {
		new ConfirmModal(
			app,
			message,
			(confirmed: boolean) => {
				resolve(confirmed);
			},
			width ?? undefined,
			height ?? undefined
		).open();
	});
}

export async function confirm(
	message: string,
	width?: number,
	height?: number
): Promise<boolean> {
	return await openConfirmModal(
		this.app,
		message,
		width ?? undefined,
		height ?? undefined
	);
}
