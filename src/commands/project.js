const vscode = require('vscode');

async function new_problem() {
    let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
    vscode.commands.executeCommand('baekjoon-vscode.load_testcase', problem_number);
    try {
        if(!vscode.workspace.fs.isWritableFileSystem('file')) {
            throw Error();
        } else {
            await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'src'), `${problem_number}.baekjoon.cpp`), Buffer.from(''));
            vscode.window.showInformationMessage("성공적으로 파일을 생성했습니다.");
            //vscode.commands.executeCommand('baekjoon.load_testcase');
        }
    } catch(e) {
        vscode.window.showErrorMessage("파일을 새로 만들 수 없습니다.");
    }
}

module.exports = {
    new_problem,
}