const vscode = require('vscode');
const { Builder, Browser, By } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');
const path = require('path'); 

const error = require('../error.js');

async function login() {
    console.log(this.globalState.get("user_data_dir"))
    const options = new Chrome.Options();
    options.addArguments(
        `user-agent=${this.globalState.get("user_agent")}`,
        `--user-data-dir=${this.globalState.get("user_data_dir")}`,
        '--profile-directory=Default'
    );

    const driver = await new Builder().forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

    try {
        await driver.get('https://www.acmicpc.net/login?next=%2F');
        if(!(await driver.getCurrentUrl()).includes('/login')) {
            throw Error(error.login.aleady_login.content)
        }
        const actions =  driver.actions({ async: true });
        await actions.move({origin: await driver.findElement(By.name('auto_login'))}).click().perform();

        let username = undefined;
        await new Promise((resolve, reject) => {
            let find_result = setInterval(async() => {
                try {
                    if((await driver.getCurrentUrl()).includes('error')) {
                        clearInterval(find_result);
                        reject();
                    }
                    username = await driver.findElement(By.className("username"));
                    resolve({interval: find_result, username: await username.getText()});
                } catch(err) {
                    console.log("결과를 찾는 중입니다.");
                }
            }, 100);
        }).then((value) => { 
            vscode.window.showInformationMessage(`${value.username}님 환영합니다.`);
            clearInterval(value.interval);
        }).catch(() => { throw Error(error.login.wrong_info.content) });
    } catch(err) {
        if(err.message == error.login.aleady_login.content) {
            error.message(err.message);
        } else if(err.message == error.login.wrong_info.content) {
            error.message(error.login.wrong_info);
        } else {
            error.message(error.login.unexpected);
        }
    } finally {
        driver.quit();
    }
}

async function submit() {
    let problem_number = path.parse(vscode.window.activeTextEditor.document.fileName).base.split('.')[0];
    const options = new Chrome.Options();
    options.addArguments(
        `user-agent=${this.globalState.get("user_agent")}`,
        `--user-data-dir=${this.globalState.get("user_data_dir")}`,
        "--profile-directory=Default",
        "--headless=new"
    );
    const driver = await new Builder().forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
    try {
        await driver.get(`https://www.acmicpc.net/submit/${problem_number}`);
        if((await driver.getCurrentUrl()).includes('login')) {
            throw Error("로그인이 필요합니다");
        } 
        await new Promise(async () => {
            // \" 이런 문자 처리가 안됨.. 
            const source_code = vscode.window.activeTextEditor.document.getText();
            await driver.executeScript(
                `arguments[0].CodeMirror.setValue(\`${source_code}\`);`,
                await driver.findElement(By.className('CodeMirror cm-s-default'))
            );
            await driver.actions({async: true}).click(await driver.findElement(By.id("submit_button"))).perform();

            let output_message = undefined;
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title:  `${problem_number}번 제출`,
                cancellable: false
            }, async ( progress ) => {
                progress.report({ increment: 0 });
                let before_status = 0;
                const progress_regexp = new RegExp('[0-9][0-9]*');
                await new Promise((resolve, reject) => {
                    const interval_id = setInterval(async () => {
                        let status = await driver.findElement(By.className('result-text')).getText();
                        const now = progress_regexp.exec(status);
                        
                        if(status.includes("맞았습니다")) {
                            clearInterval(interval_id);
                            resolve();
                        }
                        else if(status.includes("출력 형식이 잘못되었습니다")) {
                            clearInterval(interval_id);
                            reject(error.submit.RE);
                        }else if(status.includes("틀렸습니다")) {
                            clearInterval(interval_id);
                            reject(error.submit.WA);
                        } else if(status.includes("시간 초과")) {
                            clearInterval(interval_id);
                            reject(error.submit.TLE);
                        } else if(status.includes("메모리 초과")) {
                            clearInterval(interval_id);
                            reject(error.submit.MLE);
                        } else if(status.includes("출력 초과")) {
                            clearInterval(interval_id);
                            reject(error.submit.OLE);
                        } else if(status.includes("런타임")) {
                            clearInterval(interval_id);
                            reject(error.submit.RE);
                        } else if(status.includes("컴파일")) {
                            clearInterval(interval_id);
                            reject(error.submit.CE);
                        }
                        if(now != null) {
                            // 채점 중...
                            const now_status = parseInt(now[0]);
                            progress.report({message: status, increment: now_status - before_status})
                            before_status = now_status;
                        }
                    }, 10);
                }).catch((value) => {
                    output_message = value;
                })
                
                return new Promise((resolve) => {
                    setTimeout(async () => {
                        resolve();
                        if(output_message == undefined) {
                            vscode.window.showInformationMessage("정답입니다!");
                        } else {
                            error.message(output_message);
                        }
                        console.log("quit!!!!")
                        await driver.quit();
                    }, 10);
                });
            });
        });
    } catch(err) {
        console.log(err);
        vscode.window.showErrorMessage(err.message, '오류 제보하기');
    } 
}

module.exports = {
    login,
    submit,
}