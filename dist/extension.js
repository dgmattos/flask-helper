"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
let isPythonFlaskProject = false;
let hasPythonFiles = false;
let flaskTerminal;
function activate(context) {
    const checkPythonEnvironment = () => __awaiter(this, void 0, void 0, function* () {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders)
            return;
        for (const folder of folders) {
            const folderPath = folder.uri.fsPath;
            const indicators = ['requirements.txt', 'pyproject.toml', 'run.py'];
            for (const file of indicators) {
                const fullPath = path.join(folderPath, file);
                if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.includes('flask')) {
                        isPythonFlaskProject = true;
                    }
                }
            }
            const files = fs.readdirSync(folderPath);
            if (files.some(f => f.endsWith('.py'))) {
                hasPythonFiles = true;
                isPythonFlaskProject = true;
            }
        }
    });
    checkPythonEnvironment().then(() => {
        const runCommand = (cmd, msg) => {
            var _a;
            if (flaskTerminal) {
                flaskTerminal = vscode.window.createTerminal("Flask RUN APP");
            }
            flaskTerminal.show();
            flaskTerminal.sendText(cmd);
            vscode.window.showInformationMessage(msg);
            (_a = flaskTerminal.processId) === null || _a === void 0 ? void 0 : _a.then(() => treeProvider.refresh());
        };
        vscode.window.onDidCloseTerminal((terminal) => {
            if (terminal === flaskTerminal) {
                flaskTerminal = undefined;
                treeProvider.refresh();
            }
        });
        const initFlaskProject = () => __awaiter(this, void 0, void 0, function* () {
            const confirm = yield vscode.window.showInformationMessage('Deseja criar a estrutura de pastas e arquivos padrão do projeto Flask?', { modal: true }, 'Sim', 'Não');
            if (confirm !== 'Sim') {
                vscode.window.showInformationMessage('A criação do projeto Flask foi cancelada.');
                return;
            }
            const folders = vscode.workspace.workspaceFolders;
            if (!folders)
                return;
            const rootPath = folders[0].uri.fsPath;
            const modelPath = context.asAbsolutePath('src/modelos');
            // Cria diretórios padrão
            vscode.window.showInformationMessage('Criando estrutura de projeto Flask...');
            ['app', 'routes', 'templates', 'static'].forEach(dir => {
                const fullPath = path.join(rootPath, dir);
                if (!fs.existsSync(fullPath))
                    fs.mkdirSync(fullPath);
            });
            // Copia run.py para a raiz
            vscode.window.showInformationMessage('Adicionando arquivo run.py...');
            const srcRun = path.join(modelPath, 'run.py');
            const dstRun = path.join(rootPath, 'run.py');
            if (fs.existsSync(srcRun)) {
                fs.copyFileSync(srcRun, dstRun);
            }
            // Copia requirements.txt para a raiz
            vscode.window.showInformationMessage('Adicionando arquivo requirements.txt...');
            const srcReqs = path.join(modelPath, 'requirements.txt');
            const dstReqs = path.join(rootPath, 'requirements.txt');
            if (fs.existsSync(srcReqs)) {
                fs.copyFileSync(srcReqs, dstReqs);
            }
            // Copia index.html para templates/
            if (!fs.existsSync(path.join(rootPath, 'templates'))) {
                fs.mkdirSync(path.join(rootPath, 'templates'));
            }
            vscode.window.showInformationMessage('Adicionando arquivo index.html...');
            const srcHtml = path.join(modelPath, 'index.html');
            const dstHtml = path.join(rootPath, 'templates', 'index.html');
            if (fs.existsSync(srcHtml)) {
                fs.copyFileSync(srcHtml, dstHtml);
            }
            vscode.window.showInformationMessage('Projeto Flask inicializado com sucesso!');
            isPythonFlaskProject = true;
            if (typeof treeProvider !== 'undefined') {
                treeProvider.refresh();
            }
        });
        let treeProvider;
        treeProvider = new flaskRunAppProvider();
        vscode.window.registerTreeDataProvider('flaskRunAppView', treeProvider);
        context.subscriptions.push(vscode.commands.registerCommand('flaskRunApp.createVenv', () => {
            const cmd = vscode.workspace.getConfiguration().get('flaskHelper.createVenv') || 'python -m venv venv';
            runCommand(cmd, 'Criando ambiente virtual...');
        }), vscode.commands.registerCommand('flaskRunApp.installReqs', () => {
            const cmd = vscode.workspace.getConfiguration().get('flaskHelper.installReqs') || 'venv\\Scripts\\pip install -r requirements.txt';
            runCommand(cmd, 'Instalando requirements...');
        }), vscode.commands.registerCommand('flaskRunApp.runFlask', () => {
            const cmd = vscode.workspace.getConfiguration().get('flaskHelper.runFlask') || 'venv\\Scripts\\python flask run --debug';
            runCommand(cmd, 'Iniciando Flask App...');
        }), vscode.commands.registerCommand('flaskRunApp.installFlask', () => {
            runCommand('pip install flask', 'Instalando Flask...');
        }), vscode.commands.registerCommand('flaskRunApp.initFlaskProject', initFlaskProject), vscode.commands.registerCommand('flaskRunApp.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:maveric.flask-helper');
        }));
    });
}
exports.activate = activate;
class flaskRunAppProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        if (!isPythonFlaskProject) {
            return [
                new FlaskCommandItem('✨ Iniciar nova aplicação Flask', 'flaskRunApp.initFlaskProject'),
                new FlaskCommandItem('🔧 Instalar apenas Flask', 'flaskRunApp.installFlask')
            ];
        }
        const items = [
            new FlaskCommandItem('🔧 Instalar Flask', 'flaskRunApp.installFlask'),
            new FlaskCommandItem('🐍 Criar venv', 'flaskRunApp.createVenv'),
            new FlaskCommandItem('📦 Instalar requirements', 'flaskRunApp.installReqs'),
            new FlaskCommandItem('🚀 Rodar Flask App', 'flaskRunApp.runFlask')
        ];
        return items;
    }
}
class FlaskCommandItem extends vscode.TreeItem {
    constructor(label, commandId) {
        super(label);
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        if (commandId) {
            this.command = {
                command: commandId,
                title: label
            };
        }
    }
}
//# sourceMappingURL=extension.js.map