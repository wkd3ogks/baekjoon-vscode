const vscode = require('vscode');

const baekjoon = require('./commands/baekjoon');
const testcase = require('./commands/testcase');
const template = require('./commands/template');
const project = require('./commands/project');
const { env, platform } = require('process');


async function activate(context) {
	console.log('baekjoon-vscode is now active');
	/* 
	TODO 24.05.27
		1. 제출 코드 정리하기
		2. user_data_dir 값 수정(설정 파일에 넣기)
		n. 백준 프로젝트에만 제출, 테스트케이스 적용
	*/

	// 플랫폼에 따른 user_data_dir 위치 지정 (셀레니움에서 쿠키 사용 목적) 
	if(platform == 'win32') context.globalState.update("user_data_dir", `${env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default`);
	else if(platform == 'darwin') context.globalState.update("user_data_dir", `${env.HOME}/Library/Application Support/Google/Chrome/Default`);

	console.log(vscode.workspace.getConfiguration('제출').get('공개 범위'));

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