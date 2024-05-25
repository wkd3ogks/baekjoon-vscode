const vscode = require('vscode');

const baekjoon = require('./commands/baekjoon');
const testcase = require('./commands/testcase');
const template = require('./commands/template');
const project = require('./commands/project');
async function activate(context) {
	console.log('baekjoon-vscode is now active');

	/* 
	TODO 24.05.26
		1. 컴파일, 실행 설정 만들기.
		2. 제출 만들기.
	*/

	// baekjoon.js
	vscode.commands.registerCommand('baekjoon-vscode.login', baekjoon.login, context);
	vscode.commands.registerCommand('baekjoon-vscode.logout', baekjoon.logout, context);
	vscode.commands.registerCommand('baekjoon-vscode.submit', baekjoon.submit, context);

	// project.js
	//vscode.commands.registerCommand('baekjoon-vscode.create_project', project.create);
	vscode.commands.registerCommand('baekjoon-vscode.new_problem', project.new_problem);

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