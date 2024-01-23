import { App, Modal, Setting } from "obsidian";
import QSWPlugin from "./main";

type OnSubmitCallback = (name: string, startTag: string, endTag: string) => void

export class NewWrapperModal extends Modal {
	name: string
	startTag: string
	endTag: string

	constructor(app: App, public plugin: QSWPlugin, public onSubmit: OnSubmitCallback,
) {
		super(app);
	}

	onOpen() {
		const { contentEl, plugin } = this;
		contentEl.empty();

		contentEl.createEl("h1", { text: "Create a wrapper" });

		// replace this by a suggester of existing names in settings to select or enter a new value
		new Setting(contentEl)
		.setName("Tag Name")
		.setDesc("Enter a tag name.")
		.addText(text => text
			.setPlaceholder("Tag Name")
			.onChange(async (value) => {
				this.name = value;
			})
		);
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
						this.onSubmit(this.name, this.startTag, this.endTag);
						this.close();
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
