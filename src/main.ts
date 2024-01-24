import { Editor, Plugin } from "obsidian";
import { QSWSettingTab } from "./settings";
import { DEFAULT_SETTINGS } from "./types/variables";
import { NewWrapperModal } from "./modal";


export default class QSWPlugin extends Plugin {
	settings: QSWSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new QSWSettingTab(this.app, this));
		// todo: command to create edit add an editable wrapper
		// command to edit existing command

		// create a new wrapper
		this.addCommand({
			id: 'quick-shortcuts-wrap',
			name: 'Create & add wrapper',

			editorCallback: (editor: Editor) => {
				new NewWrapperModal(this.app, this, async (name, tag) => {
					await this.addWrapper(editor, name, tag)
				}).open();
			},
		});
	}

	async addWrapper(editor: Editor, name: string, tag: string) {
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
		if (this.settings.runNext) {
			await this.modifyText(editor, tag)
		}
	}

	async modifyText(editor: Editor, tag: string) {
		let replacedTag = tag.replace(/\$SEL/g, editor.getSelection());
		replacedTag = replacedTag.replace(/\$CLIPBOARD/g, await navigator.clipboard.readText());
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