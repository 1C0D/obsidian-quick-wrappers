import { Editor, Plugin, moment } from "obsidian";
import { QWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";
import { createCommand } from "./command-creator";
import { QWSettings } from "./types/global";
import { wrapperChooser } from "./wrapper-chooser";
import { WrappersManager } from "./wrappers-manager";

export default class QWPlugin extends Plugin {
	settings: QWSettings;

	async onload() {
		await this.loadSettings();
		const wrappers = this.settings.wrappers
		const wrappersIds = Object.keys(wrappers)
		if (wrappersIds.length) {
			for (const id of wrappersIds) {
				const { name, tagInput } = wrappers[id];
				createCommand(this, id, name, tagInput)
			}
		}
		this.addCommand({
			id: 'wrapper-selector',
			name: '--Wrappers Selector--',

			editorCallback: async (editor: Editor) => {
				await wrapperChooser(this, editor)
			},
		});
		this.addCommand({
			id: 'wrapper-manager',
			name: '--Wrapper Manager--',

			editorCallback: async (editor: Editor) => {
				new WrappersManager(this).open()
			},
		});

		this.addSettingTab(new QWSettingTab(this));
	}

	async modifyText(editor: Editor, tag: string) {
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
			length = await this.addTag(editor, tag, selection);
		} else {
			length = await this.toggleTag(editor, tag, selection);
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

		const datePattern = /\@\@([DdMm]{2})([-/])([DdMm]{2})[-/]?([Yy]{4}|[Yy]{2})?/;
		replacedTag = replacedTag.replace(datePattern, (_, p0, p1, p2, p3) => {
			const now = new Date();
			const stamp = moment(now).format(_.slice(2));
			return stamp
		});

		const timePattern = /\@\@([Hh]{2}):([Mm]{2}):([Ss]{2})/;
		replacedTag = replacedTag.replace(timePattern, (_, p0, p1, p2) => {
			const now = new Date();
			const stamp = moment(now).format(_.slice(2));
			return stamp
		})
		
		replacedTag = replacedTag.replace(/\@\@date/g, new Date().toLocaleDateString());
		replacedTag = replacedTag.replace(/\@\@time/g, new Date().toLocaleTimeString());
		const length = replacedTag.length;
		editor.replaceSelection(replacedTag);
		return length
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
