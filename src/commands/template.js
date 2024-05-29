const vscode = require('vscode');

async function load() {
    const editor = vscode.window.activeTextEditor;
    try {
        if(editor) {
            editor.edit((editBuilder) => {
                editBuilder.replace(new vscode.Range(editor.document.lineAt(0).range.start, editor.document.lineAt(editor.document.lineCount - 1).range.end), `#include <bits/stdc++.h>

using namespace std;

int main(void) {
    ios_base :: sync_with_stdio(false); 
    cin.tie(NULL); 
    cout.tie(NULL);

return 0;
}`);
            });
        } else {
            throw Error();
        }
    } catch(e) {
        vscode.window.showErrorMessage("템플릿을 생성할 파일을 열어주세요.");
    }
}

module.exports = {
    load,
}