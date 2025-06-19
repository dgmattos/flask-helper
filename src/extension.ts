import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const isPythonProject = async (): Promise<boolean> => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) return false;

    for (const folder of folders) {
      const folderPath = folder.uri.fsPath;

      // Verifica arquivos típicos de projeto Python
      const pythonIndicators = ['requirements.txt', 'pyproject.toml', 'setup.py'];
      for (const file of pythonIndicators) {
        if (fs.existsSync(path.join(folderPath, file))) return true;
      }

      // Verifica se há arquivos .py
      const files = fs.readdirSync(folderPath);
      if (files.some(f => f.endsWith('.py'))) return true;
    }

    return false;
  };

  isPythonProject().then((isPython) => {
    if (!isPython) {
      console.log('⚠️ Projeto não é Python. Extensão não exibirá a view.');
      return;
    }

    // Comandos
    const runCommand = (cmd: string, msg: string) => {
      const terminal = vscode.window.createTerminal("Flask Helper");
      terminal.show();
      terminal.sendText(cmd);
      vscode.window.showInformationMessage(msg);
    };

    context.subscriptions.push(
      vscode.commands.registerCommand('flaskHelper.createVenv', () => {
        runCommand('python -m venv venv', 'Criando ambiente virtual...');
      }),
      vscode.commands.registerCommand('flaskHelper.installReqs', () => {
        runCommand('pip install -r requirements.txt', 'Instalando requirements...');
      }),
      vscode.commands.registerCommand('flaskHelper.runFlask', () => {
        runCommand('python -m flask run --debug', 'Iniciando Flask App...');
      })
    );

    vscode.window.registerTreeDataProvider(
      'flaskHelperView',
      new FlaskHelperProvider()
    );
  });
}

class FlaskHelperProvider implements vscode.TreeDataProvider<FlaskCommandItem> {
  getTreeItem(element: FlaskCommandItem): vscode.TreeItem {
    return element;
  }

  getChildren(): FlaskCommandItem[] {
    return [
      new FlaskCommandItem('🐍 Criar venv', 'flaskHelper.createVenv'),
      new FlaskCommandItem('📦 Instalar requirements', 'flaskHelper.installReqs'),
      new FlaskCommandItem('🚀 Rodar Flask App', 'flaskHelper.runFlask')
    ];
  }
}

class FlaskCommandItem extends vscode.TreeItem {
  constructor(label: string, commandId: string) {
    super(label);
    this.command = {
      command: commandId,
      title: label
    };
    this.collapsibleState = vscode.TreeItemCollapsibleState.None;
  }
}
