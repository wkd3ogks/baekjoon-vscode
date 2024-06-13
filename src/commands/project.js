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
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(project_uri[0], '.result'));
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

async function delete_problem(uri) {
    let problem_number = uri.fsPath.split('/').slice(-1)[0].split('.')[0];
    
    const files = await vscode.workspace.findFiles(`.**/${problem_number}*`);
    for(let i = 0; i < files.length; i++) {
        console.log(files[i].fsPath);
        vscode.workspace.fs.delete(vscode.Uri.file(files[i].fsPath));
    }
    try {
        vscode.workspace.fs.delete(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.output/${problem_number}`));
    } catch(e) {
        console.log(e);
    }
    try {
        vscode.workspace.fs.delete(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/problems/${problem_number}.baekjoon.cpp`));
    } catch(e) {
        console.log(e);
    }
}

module.exports = {
    create,
    new_problem,
    delete_problem,
}