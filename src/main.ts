/* command to create/modify wrapper, and apply it (optional)
bug on restart ! not registered

TODO: 
Settings are missing.
selection back (cursor position)
go crazy? multi cursors ?

improvements:
add confirmation to delete button ? "delete this wrapper ?"
order in suggester last used entries. (see repeat last command?)
generer un id 100% sûr
*/


import { Editor, Plugin } from "obsidian";
import { QWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";
import { NewWrapperModal } from "./modal";
import { CommonSuggest } from "./suggester";
import { getLengthAsync, getNameAsync } from "./utils";
import { createCommand } from "./command-creator";
import { QWSettings } from "./types/global";
import { Console } from "./Console";


export default class QWPlugin extends Plugin {
	settings: QWSettings;
	name: string;
	length: number = 0;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new QWSettingTab(this.app, this));

		// create a new wrapper
		this.addCommand({
			id: 'create-modify-wrappers',
			name: 'Create modify wrappers',

			editorCallback: (editor: Editor) => {
				new NewWrapperModal(this.app, this, async (name, tag) => {
					await this.wrapperManager(editor, name, tag)
				}).open();
			},
		});
		this.addCommand({
			id: 'wrapper-chooser',
			name: 'Choose and apply a wrapper',

			editorCallback: async (editor: Editor) => {
				await this.wrapperChooser(editor)
			},
		});

		const wrappers = this.settings.wrappers

		for (const obj of Object.keys(wrappers)) {
			const { name, tagInput } = wrappers[obj];
			createCommand(this, obj, name, tagInput)
		}
	}

	async wrapperChooser(editor: Editor) {
		new CommonSuggest(this.app, this).open()
		const wrappers = this.settings.wrappers
		const name = await getNameAsync(this);
		const id = Object.values(wrappers).find(
			(wrapper) => wrapper.name === name
		)?.id
		const tag = wrappers[id!]?.tagInput || ""
		await this.modifyText(editor, tag) // apply the wrapper
	}

	async wrapperManager(editor: Editor, name: string, tag: string) {
		const { settings } = this;
		const { names } = settings;
		console.log("name", name)
		console.log("tag", tag)
		if (!name || !tag) return
		let id: string;
		if (!names.includes(name)) {
			id = this.generateKey();
			this.settings.wrappers[id] = {
				id,
				name,
				tagInput: tag,
			}
			names.push(name)
			await createCommand(this, id, name, tag)
		} else {
			const id = Object.values(settings.wrappers).find(
				(wrapper) => wrapper.name === name
			)?.id
			if (!id) return
			this.settings.wrappers[id] = {
				id: id,
				name,
				tagInput: tag,
			}
		}
		await this.saveSettings();
		// execute the wrapper
		if (this.settings.runNext) {
			this.length = 0
			await this.modifyText(editor, tag)
		}
		if (this.settings.openHK) {
			this.app.setting.open();
			this.app.setting.openTabById("hotkeys");
			const tab = this.app.setting.activeTab;
			const pluginName = this.manifest.name
			tab.searchComponent.inputEl.value = `${pluginName}: ${name}`;
			tab.updateHotkeyVisibility();
			tab.searchComponent.inputEl.blur();
		}
	}

	async modifyText(editor: Editor, tag: string) {
		const cursor = editor.getCursor();
		const selection = editor.getSelection();
		const from = editor.getCursor("from");
		console.log("from", from)
		const to = editor.getCursor("to");
		console.log("to", to)
		const start = {
			line: Math.min(from.line, to.line),
			ch: Math.min(from.ch, to.ch),
		}
		console.log("start", start)
		const fos = editor.posToOffset(start)
		console.log("fos", fos)

		if (!selection) {
			await this.addTag(editor, tag);
		} else {
			this.toggleTag(editor, tag);
		}
		const length = await getLengthAsync(this);
		console.log("length", length)
		const tos = fos + length // to offset
		await this.setSelectionProm(editor, fos, tos);
	}

	async setSelectionProm(editor: Editor, fos: number, tos: number) {
		setTimeout(() => {
			editor.setSelection(editor.offsetToPos(fos), editor.offsetToPos(tos))
		}, 50);
	}

	toggleTag(editor: Editor, tag: string) {
		const selection = editor.getSelection();
		if (!this.getMarkers(tag).length) {
			if (selection === tag) {
				editor.replaceSelection("")
			} else {
				this.length = tag.length
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
				Console.log("match[1]", match[1])
				this.length = result.length
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
		this.length = replacedTag.length;
		editor.replaceSelection(replacedTag);
	}

	generateKey() {
		const prefix = "qw-";
		const timestamp = (Date.now() % 1000000).toString();
		return prefix + timestamp
	}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
