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
function activate(context) {
    const isPythonProject = () => __awaiter(this, void 0, void 0, function* () {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders)
            return false;
        for (const folder of folders) {
            const folderPath = folder.uri.fsPath;
            // Verifica arquivos típicos de projeto Python
            const pythonIndicators = ['requirements.txt', 'pyproject.toml', 'setup.py'];
            for (const file of pythonIndicators) {
                if (fs.existsSync(path.join(folderPath, file)))
                    return true;
            }
            // Verifica se há arquivos .py
            const files = fs.readdirSync(folderPath);
            if (files.some(f => f.endsWith('.py')))
                return true;
        }
        return false;
    });
    isPythonProject().then((isPython) => {
        if (!isPython) {
            console.log('⚠️ Projeto não é Python. Extensão não exibirá a view.');
            return;
        }
        // Comandos
        const runCommand = (cmd, msg) => {
            const terminal = vscode.window.createTerminal("Flask Helper");
            terminal.show();
            terminal.sendText(cmd);
            vscode.window.showInformationMessage(msg);
        };
        context.subscriptions.push(vscode.commands.registerCommand('flaskHelper.createVenv', () => {
            runCommand('python -m venv venv', 'Criando ambiente virtual...');
        }), vscode.commands.registerCommand('flaskHelper.installReqs', () => {
            runCommand('pip install -r requirements.txt', 'Instalando requirements...');
        }), vscode.commands.registerCommand('flaskHelper.runFlask', () => {
            runCommand('python -m flask run --debug', 'Iniciando Flask App...');
        }));
        vscode.window.registerTreeDataProvider('flaskHelperView', new FlaskHelperProvider());
    });
}
exports.activate = activate;
class FlaskHelperProvider {
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        return [
            new FlaskCommandItem('🐍 Criar venv', 'flaskHelper.createVenv'),
            new FlaskCommandItem('📦 Instalar requirements', 'flaskHelper.installReqs'),
            new FlaskCommandItem('🚀 Rodar Flask App', 'flaskHelper.runFlask')
        ];
    }
}
class FlaskCommandItem extends vscode.TreeItem {
    constructor(label, commandId) {
        super(label);
        this.command = {
            command: commandId,
            title: label
        };
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }
}
//# sourceMappingURL=extension.js.map