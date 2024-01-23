import { PluginSettingTab, App } from "obsidian";
import QSWPlugin from "./main";


export class QSWSettingTab extends PluginSettingTab {
	constructor(app: App, public plugin: QSWPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// new Setting(containerEl)

	}
}
