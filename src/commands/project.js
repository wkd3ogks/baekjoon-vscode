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
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(project_uri[0], '.testcase'));
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(project_uri[0], 'problems'));
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(project_uri[0], '.template'));
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(project_uri[0], '.output'));
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
            await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'problems'), `${problem_number}.baekjoon.cpp`), Buffer.from(''));
            vscode.window.showInformationMessage("성공적으로 파일을 생성했습니다.");
            vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'problems'), `${problem_number}.baekjoon.cpp`))
                            .then((value) => {
                                vscode.window.showTextDocument(value, 1, false);
                            })
            vscode.commands.executeCommand('baekjoon.load_testcase', problem_number);
        }
    } catch(e) {
        vscode.window.showErrorMessage(e.message);
    }
}

module.exports = {
    create,
    new_problem,
}