/* command to create/modify wrapper, and apply it (optional)
you can add markers like @SEL or @CLIPB to be replaced in the tag and mix them.

TODO: 
Settings are missing. Mara Li? 
selection back (cursor position)
go crazy? multi cursors ?
when suppr remove command
change "tag" to "wrapper" ? it was not the best name

improvements:
add confirmation to delete button ? "delete this wrapper ?"
order in suggester last used entries. (see repeat last command?)
*/


import { Editor, Plugin } from "obsidian";
import { QWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";
import { NewWrapperModal } from "./modal";
import { CommonSuggest } from "./suggester";
import { getNameAsync } from "./utils";
import { createCommand } from "./command-creator";
import { QWSettings } from "./types/global";


export default class QWPlugin extends Plugin {
	settings: QWSettings;
	name: string;
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
		let id: string;
		if (!names.includes(name)) {
			id = this.generateKey();
			this.settings.wrappers[id] = {
				id,
				name,
				tagInput: tag,
			}
			names.push(name)
			
			await createCommand(this, id!, name, tag)
			
		} else {
			const id = Object.values(settings.wrappers).find(
				(wrapper) => wrapper.name === name
			)?.id
			this.settings.wrappers[id!] = {
				id: id!,
				name,
				tagInput: tag,
			}
			await this.saveSettings();
		}
		// execute the wrapper
		if (this.settings.runNext) {
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
