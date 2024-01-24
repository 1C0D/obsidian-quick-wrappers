/* with the command you can create a new wrapper, or modify it and apply it (optionally) to the editor 
you can add markers like @SEL or @CLIPB to be replaced in the tag and mix them.
TODO: reverse tags to initial state
Settings are missing. Mara Li? 
Readme to be added
*/


import { Editor, Plugin } from "obsidian";
import { QSWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";
import { NewWrapperModal } from "./modal";


export default class QSWPlugin extends Plugin {
	settings: QSWSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new QSWSettingTab(this.app, this));

		// create a new wrapper
		this.addCommand({
			id: 'quick-shortcuts-wrap',
			name: 'Create modify wrapper',

			editorCallback: (editor: Editor) => {
				new NewWrapperModal(this.app, this, async (name, tag) => {
					await this.wrapperManager(editor, name, tag)
				}).open();
			},
		});
	}

	async wrapperManager(editor: Editor, name: string, tag: string) {
		const { settings } = this;
		const { names } = settings;
		let id: string;
		if (!names.includes(name)) {
			id = this.generateKey();
			this.settings.wrappers[id] = {
				id,
				name,
				tagInput: tag,
			}
			names.push(name)
		} else {
			const id = Object.values(settings.wrappers).find(
				(wrapper) => wrapper.name === name
			)?.id
			this.settings.wrappers[id!] = {
				id: id!,
				name,
				tagInput: tag,
			}
		}
		await this.saveSettings();
		// execute the wrapper
		if (this.settings.runNext) {
			await this.modifyText(editor, tag)
		}
	}

	async modifyText(editor: Editor, tag: string) {
		const selection = editor.getSelection();
		if (!selection) {
			await this.addTag(editor, tag);
		} else {
			this.toggleTag(editor, tag);
		}
	}

	toggleTag(editor: Editor, tag: string) {
		const selection = editor.getSelection();
		if (!this.getMarkers(tag).length) {
			if (selection === tag) {
				editor.replaceSelection("")
			} else {
				editor.replaceSelection(tag)
			}
		} else {
			if (this.getMatchedTag(tag, selection)) {
				this.removeTag(editor, tag, selection)
			} else {
				this.addTag(editor, tag)
			}
		}
	}

	getMatchedTag(tag: string, selection: string) {
		if (tag.includes('@SEL')) {
			const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

			let taggedTag = escapedTag.replace(/@SEL/g, '(.*)').replace(/@CLIPB/g, '.*');

			const regex = new RegExp(taggedTag);
			return selection.match(regex);
		}
	}

	removeTag(editor: Editor, tag: string, selection: string) {
		if (tag.includes('@SEL')) {
			const match = this.getMatchedTag(tag, selection);

			if (match && match[1]) {
				const result = match[1];
				console.log("match[1]", match[1])
				setTimeout(() => {
					editor.replaceSelection(result);
				}, 0);
			}
		}
		return;
	}

	getMarkers(tag: string) {
		const markers = tag.match(/\@SEL|\@CLIPB/g) || [];
		return markers;
	}

	async addTag(editor: Editor, tag: string) {
		let replacedTag = tag.replace(/\@SEL/g, editor.getSelection());
		replacedTag = replacedTag.replace(/\@CLIPB/g, await navigator.clipboard.readText());
		editor.replaceSelection(replacedTag);
	}

	generateKey() {
		const pluginId = this.manifest.id;
		const prefix = "qsw-";
		const timestamp = (Date.now() % 1000000).toString();
		return pluginId + ":" + prefix + timestamp
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
