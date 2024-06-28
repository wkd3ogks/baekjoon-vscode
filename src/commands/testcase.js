const vscode = require('vscode');
const { Builder, Browser, By } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

const path = require('path'); 

async function load(problem_number) {
    if(problem_number == undefined) {
        problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
    }
    console.log(this.globalState);
    const options = new Chrome.Options();
    options.addArguments(
        `user-agent=${this.globalState.get("user_agent")}`,
        `--user-data-dir=${this.globalState.get("user_data_dir")}`,
        '--profile-directory=Default',
        "--headless=new"
    );

    const driver = await new Builder().forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
    try {
        await driver.get('https://www.acmicpc.net/problem/' + problem_number);
        const testcases = await driver.findElements(By.className('sampledata'));

        await vscode.workspace.fs.writeFile(
            vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.testcase'),
            `${problem_number}.info`), new TextEncoder().encode((testcases.length / 2).toString())
        );

        for(let i = 0; i < testcases.length; i += 2) {
            try {
                if(!vscode.workspace.fs.isWritableFileSystem('file')) {
                    throw Error();
                } else {
                    await vscode.workspace.fs.writeFile(
                        vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.testcase'),
                        `${problem_number}-${(i / 2) + 1}.input`), new TextEncoder().encode(await testcases[i].getText())
                    );
                    await vscode.workspace.fs.writeFile(
                        vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.testcase'),
                        `${problem_number}-${(i / 2) + 1}.output`), new TextEncoder().encode(await testcases[i + 1].getText())
                    );
                    if(problem_number == undefined) vscode.window.showInformationMessage("성공적으로 테스트케이스를 로드했습니다.");
                }
            } catch(e) {
                console.log("Error!");
            }
        }
    } catch(e) {
        console.log("Error Quit!");
    }
    finally {
        await driver.quit()
    }
}

async function run() {
    let terminal = vscode.window.createTerminal('Run Testcase');
    let problem_number = path.parse(vscode.window.activeTextEditor.document.fileName).base.split('.')[0];
    console.log(problem_number)
    try {
        terminal.show();
        terminal.sendText(`g++ ${vscode.window.activeTextEditor.document.fileName} -o ./.output/${problem_number}`);
        console.log(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}.info`))
        let testcase_size = parseInt(new TextDecoder().decode(await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}.info`)
        )));
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

            for(let i = 1; i <= testcase_size; i++) {
                let user_output = null;

                if(i == 1) terminal.sendText('cd ./.output');
                terminal.sendText(`${problem_number} > ../.result/${problem_number}-${i}.txt`);
                terminal.sendText(new TextDecoder().decode(await vscode.workspace.fs.readFile(
                    vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}-${i}.input`)
                )));
                await new Promise((resolve) => {
                    setTimeout(() => {
                        console.log("Running");
                        try {
                            vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `./.result/${problem_number}-${i}.txt`))
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
                    progress.report({ message: `${testcase_size}개 중 ${i}번째를 확인중입니다.`, increment: 100 / testcase_size });
                });

                if(user_output != null) {
                    if(user_output.trim() != new TextDecoder().decode(
                        await vscode.workspace.fs.readFile(
                            vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,
                            `/.testcase/${problem_number}-${i}.output` 
                            )
                        )).trim()) {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve();
                                vscode.window.showErrorMessage(`${testcase_size}개 중 ${i}번째를 확인중 오류를 확인했습니다`);
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
        console.log("error!", e);
    } finally {
        terminal.dispose();
    }
}

async function add() {
    try {
        let problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
        let testcase_size = parseInt(await new TextDecoder().decode(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}.info`))));
        const panel = vscode.window.createWebviewPanel(
            'add_testcase', // Identifies the type of the webview. Used internally
            '테스트케이스 추가', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {enableScripts: true} // Webview options. More on these later.
          );
          panel.webview.html = getWebviewContent(problem_number);
    
          panel.webview.onDidReceiveMessage(
            async (message) => {
                testcase_size += 1;
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}.info`),
                    new TextEncoder().encode(testcase_size.toString())
                );
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}-${testcase_size}.input`),
                    new TextEncoder().encode(message.input)
                );
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}-${testcase_size}.output`),
                    new TextEncoder().encode(message.output)
                );
                vscode.window.showInformationMessage("테스트케이스를 생성했습니다.")
            },
            undefined
          );
    } catch(e) {
        vscode.window.showErrorMessage("테스트케이스 생성에 실패했습니다.")
    }
    

}

function getWebviewContent(problem_number) {
    return `<!DOCTYPE html>
  <html lang="ko">
  <head>
      <title>테스트케이스 추가</title>
      <style>
        .container {
            width: 50vw;
            box-sizing: border-box;
        }
        html {
            font-size: 16px;
        }
        h5 {
            margin-bottom: 0.5rem;
        }
        .button-wrapper {
            display: flex;
            justify-content: end;
            margin-top: 0.5rem;
        }
        button {
            padding: 0.5rem;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: 0;
        }
        textarea {
            width: 100%;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
      </style>
  </head>
  <body>
    <div class="container">
      <h2>${problem_number}번 테스트 케이스 추가</h2>
      <div>
        <h5>입력</h5>
        <textarea id="input" rows=10></textarea>
      </div>
      <div>
        <h5>출력</h5>
        <textarea id="output" rows=10></textarea>
      </div>
      <div class="button-wrapper">
        <button>생성하기</button>
      </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const button = document.querySelector('button');
        button.addEventListener('click', () => {
            vscode.postMessage({input: document.querySelector('#input').value, output: document.querySelector('#output').value});
        });
    </script>
  </body>
  </html>`;
}

module.exports = {
    load,
    run,
    add
}