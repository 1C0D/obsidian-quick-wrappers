import { Editor, Notice, Plugin, moment } from "obsidian";
import { QWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";
import { createCommand } from "./command-creator";
import { QWSettings, Wrapper } from "./types/global";
import { wrapperChooser } from "./wrapper-chooser";
import { WrappersManager } from "./wrappers-manager";
import { DatePicker } from "src/date-pickers";

export default class QWPlugin extends Plugin {
	settings: QWSettings;

	async onload() {
		await this.loadSettings();
		const wrappers = this.settings.wrappers
		const wrappersVals = Object.values(wrappers)
		if (wrappersVals.length) {
			for (const item of wrappersVals) {
				createCommand(this, item)
			}
		}
		this.addCommand({
			id: 'wrapper-selector',
			name: 'Wrappers Selector',

			editorCallback: async (editor: Editor) => {
				await wrapperChooser(this, editor)
			},
		});
		this.addCommand({
			id: 'wrapper-manager',
			name: 'Wrapper Manager',

			editorCallback: async (editor: Editor) => {
				new WrappersManager(this).open()
			},
		});

		this.addSettingTab(new QWSettingTab(this));
	}

	async modifyText(editor: Editor, wrapper: Wrapper) {
		const selection = editor.getSelection();
		const from = editor.getCursor("from");
		const to = editor.getCursor("to");
		const start = {
			line: Math.min(from.line, to.line),
			ch: Math.min(from.ch, to.ch),
		}
		const fos = editor.posToOffset(start)

		let length = 0
		if (!selection) {
			length = await this.addTag(editor, wrapper.tagInput, selection);
		} else {
			length = await this.toggleTag(editor, wrapper.tagInput, selection);
		}
		const tos = fos + length
		this.setSelection(editor, fos, tos);
	}

	setSelection(editor: Editor, fos: number, tos: number) {
		setTimeout(() => {
			editor.setSelection(editor.offsetToPos(fos), editor.offsetToPos(tos))
		}, 50);
	}

	async addTag(editor: Editor, tag: string, selection: string) {
		let replacedTag = tag.replace(/\@\@sel/g, selection);
		replacedTag = replacedTag.replace(/\@\@cb/g, await navigator.clipboard.readText());

		// Date or time
		const datePattern = /\@\@\(.+\)/g;
		replacedTag = replacedTag.replace(datePattern, (_) => {
			const now = new Date();
			const format = _.slice(3, -1)
			const formattedDate = moment(now).format(format);
			return formattedDate
		});

		const datePickerPattern = /\@\@\+\(.+?\)/g;
		const matchResult = replacedTag.match(datePickerPattern);
		if (matchResult) {
			const dates: string[] = []

			for (const item of matchResult) {
				const format = item.slice(4, -1)
				const date = await this.handleDatePicker(format);
				if (matchResult.length > 1) new Notice(`${date}`, 2000);
				dates.push(date)
			}

			for (const item of matchResult) {
				const date = dates.shift() ?? "";
				replacedTag = replacedTag!.replace(item, date);
			}
		}

		replacedTag = replacedTag.replace(/\@\@date/g, new Date().toLocaleDateString());
		replacedTag = replacedTag.replace(/\@\@time/g, new Date().toLocaleTimeString());
		const length = replacedTag.length;
		editor.replaceSelection(replacedTag);
		return length
	}

	async handleDatePicker(format: string): Promise<string> {
		return new Promise<string>((resolve) => {
			new DatePicker(this.app, this, format, (date) => {
				resolve(date);
			}).open();
		});
	}

	async toggleTag(editor: Editor, tag: string, selection: string) {
		let length = 0
		if (!this.getMarkers(tag)?.length) {
			if (selection === tag) {
				editor.replaceSelection("")
			} else {
				length = tag.length
				editor.replaceSelection(tag)
			}
		} else {
			if (this.getMatchedTag(tag, selection)) {
				length = this.removeTag(editor, tag, selection)
			} else {
				length = await this.addTag(editor, tag, selection)
			}
		}
		return length
	}

	getMarkers(tag: string) {
		const markers = tag.match(/\@\@sel|\@\@cb/g) || [];
		return markers;
	}

	getMatchedTag(tag: string, selection: string) {
		if (tag.includes('@@sel')) {
			const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

			let taggedTag = escapedTag.replace(/@@sel/g, '(.*)').replace(/@@cb/g, '.*');

			const regex = new RegExp(taggedTag);
			return selection.match(regex);
		}
	}

	removeTag(editor: Editor, tag: string, selection: string) {
		let length = 0
		if (tag.includes('@@sel')) {
			const match = this.getMatchedTag(tag, selection);
			if (match && match[1]) {
				length = match[1].length
				setTimeout(() => {
					editor.replaceSelection(match[1]);
				}, 0);
			}
		}
		return length;
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
