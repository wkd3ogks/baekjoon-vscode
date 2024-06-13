# baekjoon-vscode README

Baekjoon Online Judge를 활용해 알고리즘을 학습하는데 있어 여러 편의사항을 제공하는 Visual Studio Code 확장 프로그램. 

## Features

- 테스트케이스 자동 점검
- 코드 템플릿 적용
- 정답 코드 제출

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

- selenium-webdriver: ^4.21.0
- chrome: 125.0.6422.112

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Support Language
- C++

## Source files
    .
    │
    ├── ...
    ├── src                
    │   ├── commands        
            ├── project.js      # 프로젝트 관리 코드  
            ├── baekjoon.js     # 백준 사이트와 상호작용하는 코드
            ├── template.js     # 템플릿 관련 코드
            └── testcase.js     # 테스트케이스 관련 코드
    │   ├── error.js            # 에러 관련 코드 
    │   └── extends.js          # 메인 코드
    ├── package.json            # 패키지 관리
    └── ...


## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

* `제출.공개범위`: 백준 사이트에 코드 제출 시 공개여부를 결정한다.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
