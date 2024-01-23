import { App, Modal, Notice, Setting, TextComponent } from "obsidian";
import QSWPlugin from "./main";
import { CommonSuggest } from "./suggester";

type OnSubmitCallback = (name: string, startTag: string, endTag: string) => void

export class NewWrapperModal extends Modal {
	name: string
	startTag: string
	endTag: string
	inputEl: HTMLInputElement
	suggester: CommonSuggest
	nameInput: TextComponent

	constructor(app: App, public plugin: QSWPlugin, public onSubmit: OnSubmitCallback,
	) {
		super(app);
	}

	onOpen() {
		const { contentEl, plugin } = this;
		contentEl.empty();

		contentEl.createEl("h1", { text: "Create or Edit a wrapper" });

		// add a button to delete name and setting. with confirmation
		new Setting(contentEl)
			.setName("Tag Name")
			.setDesc("Enter a tag name.")
			.addText(text => {
				this.inputEl = text.inputEl
				this.nameInput = text  // used in the fuzzy suggester
				this.inputEl.onfocus = () => {
					this.suggester.open();
				}
			})
		this.suggester = new CommonSuggest(this.app, this);

		new Setting(contentEl)
			.setName("Start Tag")
			.setDesc("Enter Start tag.")
			.addTextArea(text => text
				.setPlaceholder("```js\n(added line)")
				.onChange(async (value) => {
					this.startTag = value;
				})
			);
		new Setting(contentEl)
			.setName("End Tag")
			.setDesc("Enter End tag.")
			.addTextArea(text => text
				.setPlaceholder("\n```")
				.onChange(async (value) => {
					this.endTag = value;
				})
			);


		new Setting(this.contentEl)
			.addButton((b) => {
				b.setIcon("checkmark")
					.setCta()
					.onClick(() => {
						if(!this.name) { // more conditions to add later
							new Notice("Please enter a name.", 2000);
						}else{
							this.onSubmit(this.name, this.startTag, this.endTag);
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
