const vscode = require('vscode');
const { Builder, Browser, By, until } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

const { platform } = require('process'); // 운영체제 정보 받아오기
const clipboard = require("copy-paste");

async function login() {
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
        this.globalState.update("username", username);
        vscode.window.showInformationMessage(this.globalState.get("username") + "님 환영합니다.");
        
    } catch(err) {
        console.error(err);
        vscode.window.showErrorMessage('로그인에 실패했습니다.', '오류 제보하기');
        this.globalState.update("username", undefined);
    } finally {
        await driver.quit()
    }
}

async function logout() {
    let options = new Chrome.Options();
    options.addArguments("--headless=new");
    let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
    options.addArguments('user-agent='+user_agent, '--user-data-dir=/Users/aksworns2/Library/Application Support/Google/Chrome/Default', '--profile-directory=Default');
    let driver = await new Builder().forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
    try {
        if(this.globalState.get("username") == undefined) {
            throw Error();
        }
        await driver.get('https://www.acmicpc.net/');
        await driver.executeScript('document.getElementById("logout_form").submit();');
        vscode.window.showInformationMessage('성공적으로 로그아웃 되었습니다.');
        //this.globalState.update("username", undefined);
    } catch(err) {
        console.log(err);
        vscode.window.showErrorMessage("로그아웃에 실패했습니다.");
    } finally {
        await driver.quit()
    }
}

async function submit() {
    let problem_number = vscode.window.activeTextEditor.document.fileName.split('/').slice(-1)[0].split('.')[0];
    let options = new Chrome.Options();
    //options.addArguments("--headless=new");
    let user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';
    options.addArguments('user-agent='+user_agent, '--user-data-dir=/Users/aksworns2/Library/Application Support/Google/Chrome/Default', '--profile-directory=Default');
    let driver = await new Builder().forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
    try {
        await driver.get('https://www.acmicpc.net/submit/' + problem_number);
        
        if(this.globalState.get("username") == undefined) {
            throw Error();
        }
        
        await new Promise(() => {
            clipboard.copy(vscode.window.activeTextEditor.document.getText(),
            async () => {
                await driver.actions()
                .click(await driver.findElement(By.className('CodeMirror cm-s-default')))
                .keyDown(platform == 'darwin' ? '\uE03D' : '\uE009')
                .sendKeys('v')
                .click(await driver.findElement(By.id('submit_button')))
                .perform()

                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "소스코드 제출 : ",
                    cancellable: true
                }, async ( progress ) => {
                    
        
                    // token.onCancellationRequested(() => {
                    //     console.log("중단");
                    //     return new Promise((resolve) => {
                    //         setTimeout(() => {
                    //             resolve();
                    //         }, 1000);
                    //     });
                    // });
                    progress.report({ increment: 0 });
                    let before_status = 0;
                    let number_regexp = new RegExp('[0-9][0-9]*');
                    await new Promise((resolve) => {
                        let interval_id = setInterval(async () => {
                            let status = await driver.findElement(By.className('result-text')).getText();
                            let now = number_regexp.exec(status);
                            if(now != null) {
                                progress.report({message: status, increment: parseInt(now[0]) - before_status})
                                before_status = parseInt(now[0]);
                            }
                            if(status == "맞았습니다!!") {
                                clearInterval(interval_id);
                                resolve();
                            }
                            else if(status == "출력 형식이 잘못되었습니다") {
                                clearInterval(interval_id);
                                resolve();
                            }else if(status == "틀렸습니다") {
                                clearInterval(interval_id);
                                resolve();
                            } else if(status == "시간 초과") {
                                clearInterval(interval_id);
                                resolve();
                            } else if(status == "메모리 초과") {
                                clearInterval(interval_id);
                                resolve();
                            } else if(status == "출력 초과") {
                                clearInterval(interval_id);
                                resolve();
                            } else if(status == "런타임에러") { //정규표현식 사용 필요. 
                                clearInterval(interval_id);
                                resolve();
                            } else if(status == "컴파일 에러") {
                                clearInterval(interval_id);
                                resolve();
                            }
                        }, 10);
                    })
                    
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                            vscode.window.showInformationMessage('정답입니다');
                        }, 1000);
                    });
                });
            }
        )
        })
    } catch(err) {
        vscode.window.showErrorMessage('예상치 못한 오류가 발생했습니다.', '오류 제보하기');
    } finally {
        await driver.quit()
    }
}

module.exports = {
    login,
    logout,
    submit,
}