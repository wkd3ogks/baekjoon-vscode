const vscode = require('vscode');
const { Builder, Browser, By, until } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

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
        if(this.globalState.get("username") == undefined) {
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
}

module.exports = {
    login,
    logout,
    submit,
}