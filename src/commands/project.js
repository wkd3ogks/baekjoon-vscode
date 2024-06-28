const vscode = require('vscode');
const path = require('path');

async function create() {
    const directories = ['.testcase', 'problems', '.template', '.output', '.result'];
    const options  = {
        canSelectMany: false,
        openLabel: '프로젝트 폴더로 설정',
        canSelectFiles: false,
        canSelectFolders: true
    };
    try {
        let project_uri = await vscode.window.showOpenDialog(options);
        if(project_uri == undefined) {
            vscode.window.showInformationMessage("프로젝트 생성을 취소했습니다.");
            return;
        }
        
        vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(project_uri[0].path));
        for(let i = 0; i < directories.length; i++) {
            await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(project_uri[0], directories[i]));
        }
    } catch(e) {
        vscode.window.showErrorMessage("오류가 발생했습니다");
    }
}

async function new_problem() {
    try {
        let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
        if(problem_number == undefined) {
            
            throw Error("파일 생성을 취소했습니다.");
        }
        if(!vscode.workspace.fs.isWritableFileSystem('file')) {
            throw Error("파일을 새로 쓸 수 없습니다.");
        } else {
            await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'problems'), `${problem_number}.baekjoon.cpp`), Buffer.from(''));
            vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'problems'), `${problem_number}.baekjoon.cpp`))
                .then((value) => {
                    vscode.window.showTextDocument(value, 1, false);
                })
            await vscode.commands.executeCommand('baekjoon-vscode.load_testcase', problem_number);
            vscode.window.showInformationMessage("파일을 생성했습니다.")
        }
    } catch(e) {
        vscode.window.showErrorMessage(e.message);
    }
}

async function delete_problem(uri) {
    let problem_number = path.parse(uri.fsPath).base.split('.')[0];
    const files = await vscode.workspace.findFiles(`.**/${problem_number}*`); // .XXX 폴더 내 문제 번호를 포함하는 파일 전체 탐색
    try {
        for(let i = 0; i < files.length; i++) vscode.workspace.fs.delete(vscode.Uri.file(files[i].fsPath));
        vscode.workspace.fs.delete(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/problems/${problem_number}.baekjoon.cpp`));
    } catch(e) {
        vscode.window.showErrorMessage("삭제 중 오류가 발생했습니다.")
    }
}

module.exports = {
    create,
    new_problem,
    delete_problem,
}