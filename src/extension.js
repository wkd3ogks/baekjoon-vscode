const vscode = require('vscode');

const baekjoon = require('./commands/baekjoon');
const testcase = require('./commands/testcase');
const template = require('./commands/template');
const project = require('./commands/project');
const { env, platform } = require('process');


async function activate(context) {
	console.log('baekjoon-vscode is now active');
	/* 
	TODO 24.05.30
		0. 파일 생성 시 템플릿 자동 생성
		0. 문제 삭제 시 테스트케이스 및 실행 파일 같이 삭제.
		1. 제출 코드 정리하기
		n. 백준 프로젝트에만 제출, 테스트케이스 적용
	*/

	// 플랫폼에 따른 user_data_dir 위치 지정 (셀레니움에서 쿠키 사용 목적) 
	if(platform == 'win32') {
		context.globalState.update("user_data_dir", `${env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default`);
		context.globalState.update("ctrl_or_command", "\uE009");
	}
	else if(platform == 'darwin') {
		context.globalState.update("user_data_dir", `${env.HOME}/Library/Application Support/Google/Chrome/Default`);
		context.globalState.update("ctrl_or_command", "\uE03D");
	} 

	context.globalState.update(
		"user_agent",
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36"
	);
	
	console.log(vscode.workspace.getConfiguration('제출').get('공개 범위'));

	// baekjoon.js
	vscode.commands.registerCommand('baekjoon-vscode.login', baekjoon.login, context);
	vscode.commands.registerCommand('baekjoon-vscode.submit', baekjoon.submit, context);

	// project.js
	vscode.commands.registerCommand('baekjoon-vscode.new_project', project.create);
	vscode.commands.registerCommand('baekjoon-vscode.new_problem', project.new_problem);
	vscode.commands.registerCommand('baekjoon-vscode.delete_problem', project.delete_problem);

	// template.js
	vscode.commands.registerCommand('baekjoon-vscode.load_template', template.load);

	// testcase.js
	vscode.commands.registerCommand('baekjoon-vscode.load_testcase', testcase.load, context);
	vscode.commands.registerCommand('baekjoon-vscode.add_testcase', testcase.add, context);
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