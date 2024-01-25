# Obsidian Quick wrappers

Create wrappers and add shortcut to them, to quickly surround your selection and/or clipboard content in the document.

Commands:
- Each new wrapper is creating a command and you can add a shortcut to it.
- `"Create modify wrappers"` choose a wrapper name and create/modify/delete the wrapper and optionally apply it. It's a nice way to create/test/modify your wrapper.

- `"Choose and apply a wrapper"` choose a wrapper name and apply it to document. You can revert a selection with already a wrapper on it.   
e.g running several times on the selection: `text` → `"[text](text)"` → `text`.  
    
**Important**: you can add markers as @SEL (for selection) and "@CLIPB" (for clipboard) and mix them. You don't to remember this, itt's written in the description in the modal. example of wrapper:
```
[@SEL](@SEL)
@CLIPB
``` 
(having a selection before and in the clipboard the content accompanying the wikilink)

## developpement

do "npm start" at first, or a npm i 
- `npm run start` = npm install + npm run dev
- `npm run bacp` = npm run build +  git add + commit (prompt to enter message) + push
- `npm run acp` = git add + commit (prompt to enter message) + push
- `npm run version` = prompt to ask what version (patch(1), minor(2), major(3) or manual entering e.g 1.2.0 ). do it after your acp.
- `npm run release`= publish a release on github with the actual version and prompt for the release message
- `npm run test` = npm run build + export main.js manifest & styles.css(optional) to a target vault, so it can run as an installed plugin and test it.
Prompts are guiding you.    
if you overwrite an existing plugin folder in the target vault it will overwrite only this 3 files.

- Use Console instead of console. by default all Console.log/debug are switched OFF on production (npm run build), and ON on developpement (npm run dev), and Console.log or debug are forced to debug.  OFF on mobiles