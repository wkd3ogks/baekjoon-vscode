// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const baekjoon = require('./commands/baekjoon');
const testcase = require('./commands/testcase');
const template = require('./commands/template');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('baekjoon-vscode is now active');

	vscode.commands.registerCommand('baekjoon-vscode.new_problem', async function() {
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
	});

	//baekjoon.js
	vscode.commands.registerCommand('baekjoon-vscode.login', baekjoon.login, context);
	vscode.commands.registerCommand('baekjoon-vscode.logout', baekjoon.logout, context);
	vscode.commands.registerCommand('baekjoon-vscode.submit', baekjoon.submit, context);

	// template.js
	vscode.commands.registerCommand('baekjoon-vscode.load_template', template.load);

	// testcase.js
	vscode.commands.registerCommand('baekjoon-vscode.load_testcase', testcase.load);
	vscode.commands.registerCommand('baekjoon-vscode.run_testcase', testcase.run);
}

// This method is called when your extension is deactivated
function deactivate() {
	console.log('baekjoon-vscode is now deactive');
}

module.exports = {
	activate,
	deactivate
}