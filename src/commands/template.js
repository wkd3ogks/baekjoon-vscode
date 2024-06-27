const vscode = require('vscode');

async function load() {
    const editor = vscode.window.activeTextEditor;
    try {
        if(editor) {
            const template = await new TextDecoder().decode(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.template/template.cpp`)));
            editor.edit((editBuilder) => {
                editBuilder.replace(new vscode.Range(editor.document.lineAt(0).range.start, editor.document.lineAt(editor.document.lineCount - 1).range.end), template);
            });
        } else {
            throw Error("템플릿을 생성할 파일을 열어주세요.");
        }
    } catch(e) {
        vscode.window.showErrorMessage(e.message);
    }
}

module.exports = {
    load,
}