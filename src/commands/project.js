const vscode = require('vscode');

async function create() {
    const options  = {
        canSelectMany: false,
        openLabel: 'Select',
        canSelectFiles: false,
        canSelectFolders: true
    };
    let project_uri = await vscode.window.showOpenDialog(options);
    vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(project_uri[0].path));
}

async function new_problem() {
    try {
        let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
        if(problem_number == undefined) {
            throw Error("파일 생성을 취소했습니다.");
        }
        vscode.commands.executeCommand('baekjoon-vscode.load_testcase', problem_number);
        if(!vscode.workspace.fs.isWritableFileSystem('file')) {
            throw Error("파일을 새로 쓸 수 없습니다.");
        } else {
            await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'src'), `${problem_number}.baekjoon.cpp`), Buffer.from(''));
            vscode.window.showInformationMessage("성공적으로 파일을 생성했습니다.");
            vscode.commands.executeCommand('baekjoon.load_testcase', problem_number);
        }
    } catch(e) {
        vscode.window.showErrorMessage(e.message);
    }
}

module.exports = {
    new_problem,
}