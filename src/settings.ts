/* 
add hk button
if hotkey show it
*/


import { PluginSettingTab, Setting } from "obsidian";
import QWPlugin from "./main";
import { sortSettings } from "./utils";
import wrapperModal from "./creator-modal";
import { Console } from "./Console";
import { Wrapper } from "./types/global";

export class QWSettingTab extends PluginSettingTab {
	constructor(public plugin: QWPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		const { names, wrappers } = this.plugin.settings

		new Setting(containerEl)
			.setName("Create a New Wrapper")
			.setDesc("Add some @SEL and/or @CLIPB to include selection or clipboard content. go crazy")
			.addButton(cb => {
				cb.setIcon("plus")
					.onClick(() => {
						new wrapperModal(this.plugin, async (wrapper) => {
							Console.log("wrapper", wrapper)
							this.display()
						}).open()
					})
			})

		sortSettings(this.plugin)

		if (!names.length) return
		Console.log("names", names)
		for (const name of names) {
			wrapperSettings(this, name, containerEl, wrappers)
		}
	}
}

function wrapperSettings(_this: QWSettingTab, name: string, containerEl: HTMLElement, wrappers: Record<string, Wrapper>) {
	if (!Object.values(wrappers).length) return
	Console.log("name", name)
	const filter = Object.values(wrappers).filter((w) => {
		Console.log("w", w)
		return w.name === name
	})
	Console.log("filter", filter)
	const id = filter[0]?.id
	Console.log("matching Id", id)
	if (!id) return
	const wrapper = wrappers[id];
	const pluginId = _this.plugin.manifest.id
	const _id = pluginId + ":" + id;
	const hotkey = this.app.hotkeyManager.getHotkeys(_id)?.[0];
	let shortcut = "";
	let nameHK = ""
	if (hotkey) {
		const key = hotkey.key;
		const modif = hotkey.modifiers;
		shortcut = `${modif.join("+")}+${key}`;
		if (hotkey) nameHK = name + ` [${shortcut}]`;
	}

	const desc = createFragment((descEl) => {
		wrapper.tagInput.split("\n").forEach((line) => {
			const div = descEl.createEl("div");
			div.appendText(line);
		})
	})
	new Setting(containerEl)
		.setName(hotkey ? nameHK : name)
		.setDesc(desc)
		.addExtraButton(bt => {
			bt.setIcon("pencil");
			bt.onClick(async () => {
				new wrapperModal(_this.plugin, async (newWrapper, editmode) => {
					if (!editmode) return
					const { name, tagInput } = newWrapper
					Console.log("name", name)
					Console.log("tagInput", tagInput)
					_this.display()
				}, wrapper).open();
			})
		})

		.addExtraButton(bt => {
			bt.setIcon("keyboard");
			bt.onClick(async () => {
				_this.app.setting.open();
				_this.app.setting.openTabById("hotkeys");
				const tab = _this.app.setting.activeTab;
				const pluginName = _this.plugin.manifest.name
				const text = `${pluginName}: ${name}`;
				Console.log("text", text)
				tab.searchComponent.inputEl.value = text;
				await tab.updateHotkeyVisibility();
				await tab.searchComponent.inputEl.blur();
			})
		})
		.addExtraButton(bt => {
			bt.setIcon("trash");
			bt.onClick(async () => {
				delete _this.plugin.settings.wrappers[id];
				await _this.plugin.saveSettings();
				_this.display();
			})
		})
}