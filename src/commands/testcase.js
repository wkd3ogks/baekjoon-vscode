const vscode = require('vscode');
const { Builder, Browser, By } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

async function load(problem_number) {
    if(problem_number == undefined) {
        problem_number = await vscode.window.showInputBox({"placeHolder": "문제 번호를 입력해주세요."});
    }
    let options = new Chrome.Options();
    //options.addArguments("--headless=new");
    let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
    options.addArguments('user-agent='+user_agent, '--user-data-dir=/Users/aksworns2/Library/Application Support/Google/Chrome/Default', '--profile-directory=Default');
    let driver = await new Builder().forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
    try {
        await driver.get('https://www.acmicpc.net/problem/' + problem_number);
        let testcases = await driver.findElements(By.className('sampledata'));

        await vscode.workspace.fs.writeFile(
            vscode.Uri.joinPath(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.testcase'),
            `${problem_number}-metadata`), new TextEncoder().encode((testcases.length / 2).toString())
        );

        for(let i = 0; i < testcases.length; i+= 2) {
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
                    vscode.window.showInformationMessage("성공적으로 파일을 생성했습니다.");
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
    let problem_number = vscode.window.activeTextEditor.document.fileName.split('/').slice(-1)[0].split('.')[0];
    console.log(problem_number);
    try {
        terminal.sendText('g++ main.cpp -o output');
        let testcase_size = parseInt(new TextDecoder().decode(await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}-metadata`)
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

                terminal.sendText(`./output > ./.output/output${i}.txt`);
                terminal.sendText(new TextDecoder().decode(await vscode.workspace.fs.readFile(
                    vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}-${i}.input`)
                )));
                await new Promise((resolve) => {
                    setTimeout(() => {
                        console.log("Running");
                        try {
                            vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `/.testcase/${problem_number}-${i}.output`))
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

module.exports = {
    load,
    run
}