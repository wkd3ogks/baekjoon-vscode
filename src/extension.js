// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { Builder, Browser, By, until, WebElement } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('baekjoon-vscode is now active');
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	vscode.commands.registerCommand('baekjoon-vscode.login', async function () {
		// The code you place here will be executed every time your command is executed
		let options = new Chrome.Options();
		//options.addArguments("--headless=new");
		let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
		options.addArguments('user-agent='+user_agent, '--user-data-dir=/Users/aksworns2/Library/Application Support/Google/Chrome/Default', '--profile-directory=Default');
		let driver = await new Builder().forBrowser(Browser.CHROME)
		.setChromeOptions(options)
		.build()
		try {
			await driver.get('https://www.acmicpc.net/login?next=%2F');
			const actions =  driver.actions({async: true});
			await actions.move({origin: await driver.findElement(By.name('auto_login'))}).click().perform();
			let username_element = await driver.wait(until.elementLocated(By.className("username")));
			let username = await username_element.getText();
			let user_cookie = await driver.manage().getCookie('bojautologin');
			context.globalState.update("username", username);
			vscode.window.showInformationMessage(context.globalState.get("username") + "님 환영합니다.");
			
		} catch(err) {
			console.error(err);
			vscode.window.showErrorMessage('로그인에 실패했습니다.', '오류 제보하기');
			context.globalState.update("username", undefined);
		} finally {
			await driver.quit()
		}
	});

	vscode.commands.registerCommand('baekjoon-vscode.submit', async function() {
		let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
		let options = new Chrome.Options();
		//options.addArguments("--headless=new");
		let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
		options.addArguments('user-agent='+user_agent, '--user-data-dir=/Users/aksworns2/Library/Application Support/Google/Chrome/Default', '--profile-directory=Default');
		let driver = await new Builder().forBrowser(Browser.CHROME)
		.setChromeOptions(options)
		.build();
		try {
			await driver.get('https://www.acmicpc.net/submit/' + problem_number);
			if(context.globalState.get("username") == undefined) {
				throw Error();
			}
			await driver.actions()
				.click(await driver.findElement(By.className('CodeMirror cm-s-default')))
				.sendKeys('Selenium!')
				.perform()
			await driver.sleep(100000);
		} catch(err) {
			vscode.window.showErrorMessage('예상치 못한 오류가 발생했습니다.', '오류 제보하기');
		} finally {
			await driver.quit()
		}
	});

	vscode.commands.registerCommand('baekjoon-vscode.logout', async function() {
		let options = new Chrome.Options();
		options.addArguments("--headless=new");
		let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
		options.addArguments('user-agent='+user_agent, '--user-data-dir=/Users/aksworns2/Library/Application Support/Google/Chrome/Default', '--profile-directory=Default');
		let driver = await new Builder().forBrowser(Browser.CHROME)
		.setChromeOptions(options)
		.build();
		try {
			if(context.globalState.get("username") == undefined) {
				throw Error();
			}
			await driver.get('https://www.acmicpc.net/');
			await driver.executeScript('document.getElementById("logout_form").submit();');
			vscode.window.showInformationMessage('성공적으로 로그아웃 되었습니다.');
			context.globalState.update("username", undefined);
		} catch(err) {
			vscode.window.showErrorMessage("로그아웃에 실패했습니다.");
		} finally {
			await driver.quit()
		}
	});

	vscode.commands.registerCommand('baekjoon-vscode.new_problem', async function() {
		let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
		//vscode.commands.executeCommand(); -> 테스트케이스 받아오기..
		try {
			if(!vscode.workspace.fs.isWritableFileSystem('file')) {
				throw Error();
			} else {
				await vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'src'), `${problem_number}.baekjoon.cpp`), Buffer.from(''));
				vscode.window.showInformationMessage("성공적으로 파일을 생성했습니다.");
			}
		} catch(e) {
			vscode.window.showErrorMessage("파일을 새로 만들 수 없습니다.");
		}
	});

	vscode.commands.registerCommand('baekjoon-vscode.template_code', async function() {
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
	});

	vscode.commands.registerCommand('baekjoon-vscode.testcase', async function() {
		let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
		let options = new Chrome.Options();
		//options.addArguments("--headless=new");
		let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
		options.addArguments('user-agent='+user_agent, '--user-data-dir=/Users/aksworns2/Library/Application Support/Google/Chrome/Default', '--profile-directory=Default');
		let driver = await new Builder().forBrowser(Browser.CHROME)
		.setChromeOptions(options)
		.build();

		let terminal = vscode.window.createTerminal('Run Testcase');
		try {
			await driver.get('https://www.acmicpc.net/problem/' + problem_number);
			let testcases = await driver.findElements(By.className('sampledata'));
			
			terminal.sendText('g++ main.cpp -o output');

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "테스트 케이스 확인 ",
				cancellable: true
			}, async (progress, token) => {
				

				token.onCancellationRequested(() => {
					console.log("테스트케이스 확인 중단");
					return new Promise((resolve) => {
						setTimeout(() => {
							resolve();
						}, 1000);
					});
				});
	
				progress.report({ increment: 0 });

			for(let i = 0; i < testcases.length - 1; i+=2) {
				let user_output = null;

				terminal.sendText(`./output > output${(i / 2) + 1}.txt`);
				terminal.sendText(await testcases[i].getText());
				await new Promise((resolve) => {
					setTimeout(() => {
						console.log("Running");
						try {
							vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `output${(i / 2) + 1}.txt`))
								.then(read_file => {
									resolve(read_file);
								})
								.then(undefined, err => {
									console.log(err);
								})
						} catch(e) {
							console.log(e);
						}
					}, 3000);
				}).then((value) => {
					user_output = new TextDecoder().decode(value);
					progress.report({ message: `${testcases.length / 2}개 중 ${(i / 2) + 1}번째를 확인중입니다.`, increment: 100 / (testcases.length / 2) });
				});

				if(user_output != null) {
					if(user_output.trim() != (await testcases[i + 1].getText()).trim()) {
						return new Promise((resolve) => {
							setTimeout(() => {
								resolve();
								vscode.window.showErrorMessage(`${testcases.length / 2}개 중 ${(i / 2) + 1}번째를 확인중 오류를 확인했습니다`);
							}, 1000);
						});
						
					}
				}
			}

			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
					vscode.window.showInformationMessage('모든 테스트 케이스를 통과했습니다.');
				}, 1000);
			});
		});
			
		} catch(e) {
			console.log("Error Quit!");
		}
		finally {
			terminal.dispose();
			await driver.quit()
		}
	});

}

// This method is called when your extension is deactivated
function deactivate() {
	console.log('baekjoon-vscode is now deactive');
}

module.exports = {
	activate,
	deactivate
}


// vscode.commands.registerCommand('baekjoon-vscode.view_problem', async function() {
// 	let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
// 	let problem_title = undefined;
// 	let problem_description = undefined;
// 	let options = new Chrome.Options();
// 	options.addArguments("--headless=new");
// 	let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
// 	options.addArguments('user-agent='+user_agent);
// 	let driver = await new Builder().forBrowser(Browser.CHROME)
// 	.setChromeOptions(options)
// 	.build()
// 	const html = (await (await fetch('https://www.acmicpc.net/problem/' + problem_number, {
// 		headers: new Headers({
// 			"User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.3 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36"
// 		}),
// 	})).text());
// 	try {
// 		await driver.get('https://www.acmicpc.net/problem/' + problem_number);
// 		driver.executeScript("document.getElementsByClassName('header')[0].remove();");
// 		driver.executeScript("document.getElementsByClassName('footer-v3')[0].remove();");
// 		driver.executeScript("document.getElementsByClassName('nav')[0].remove();");
// 		problem_title = await driver.wait(until.elementLocated(By.id("problem_title"))).getText();
// 		let all_images = await driver.findElements(By.css('#problem_description img'));
// 		for(let i = 0; i < all_images.length; i++) {
// 			let url = await all_images[i].getAttribute('src');
// 			let redirected_response = await fetch(url, {
// 				redirect: "follow",
// 				headers: new Headers({"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"}),
// 			});
// 			await driver.executeScript(`arguments[0].src = '${redirected_response.url}'`, all_images[i]);
// 		}
// 		problem_description = await driver.getPageSource();
// 	} catch(err) {
// 		console.error(err);
// 	} finally {
// 		await driver.quit()
// 	}
// //This driver instance does not have a valid session ID
// 	const panel = vscode.window.createWebviewPanel(
// 		`${problem_number}번: ${problem_title}`,
// 		`${problem_number}번: ${problem_title}`,
// 		vscode.ViewColumn.One,
// 		{}
// 	);
// 	panel.webview.html = problem_description;
// });