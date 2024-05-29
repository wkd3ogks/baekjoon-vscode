const vscode = require('vscode');

// 에러는 모두 content, button, command를 가진다.
const login = {
    aleady_login: {
        content: "이미 로그인되어 있습니다.",
        button: "로그아웃",
        command: "baekjoon-vscode.logout"
    },
    unexpected: {
        content: "로그인에 실패했습니다.",
        button: "다시 로그인",
        command: "baekjoon-vscode.login"
    },
    wrong_info: {
        content: "아이디 또는 비밀번호가 잘못되었습니다.",
        button: "다시 로그인",
        command: "baekjoon-vscode.login"
    }
}

const submit = {
    OLE: {
        content: "출력 초과입니다",
        button: "자세히 확인하기",
        command: ""
    },
    CE: {
        content: "컴파일 에러입니다",
        button: "자세히 확인하기",
        command: ""
    },
    PE: {
        content: "출력 형식이 잘못되었습니다",
        button: "자세히 확인하기",
        command: ""
    },
    RE: {
        content: "런타임 에러입니다",
        button: "자세히 확인하기",
        command: ""
    },
    TLE: {
        content: "시간 초과입니다",
        button: "자세히 확인하기",
        command: ""
    },
    WA: {
        content: "틀렸습니다",
        button: "자세히 확인하기",
        command: ""
    },
    MLE: {
        content: "메모리 초과입니다",
        button: "자세히 확인하기",
        command: ""
    },
}

function message(error) {
    vscode.window.showErrorMessage(error.content, error.button)
    .then((value) => {
        if(value == error.button) {
            vscode.commands.executeCommand(error.command);
        }
    });
}

module.exports = {
    login,
    message,
    submit
}