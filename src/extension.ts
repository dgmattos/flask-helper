import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let isPythonFlaskProject = false;
let hasPythonFiles = false;

export function activate(context: vscode.ExtensionContext) {
  const checkPythonEnvironment = async (): Promise<void> => {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) return;

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
  };

  checkPythonEnvironment().then(() => {
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
      }),
      vscode.commands.registerCommand('flaskHelper.installFlask', () => {
        runCommand('pip install flask', 'Instalando Flask...');
      }),
      vscode.commands.registerCommand('flaskHelper.initFlaskProject', () => {
        const terminal = vscode.window.createTerminal("Iniciando Flask");
        terminal.show();
        terminal.sendText('python -m venv venv');
        terminal.sendText('venv/Scripts/activate');
        terminal.sendText('pip install flask');
        terminal.sendText('git clone https://github.com/dgmattos/br.com.maveric.flask.start .');
        vscode.window.showInformationMessage('Novo projeto Flask sendo inicializado...');
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
    if (!isPythonFlaskProject) {
      return [
        new FlaskCommandItem('✨ Iniciar nova aplicação Flask', 'flaskHelper.initFlaskProject')
      ];
    }

    return [
      new FlaskCommandItem('🐍 Criar venv', 'flaskHelper.createVenv'),
      new FlaskCommandItem('📦 Instalar requirements', 'flaskHelper.installReqs'),
      new FlaskCommandItem('🚀 Rodar Flask App', 'flaskHelper.runFlask'),
      new FlaskCommandItem('🔧 Instalar Flask', 'flaskHelper.installFlask')
    ];
  }
}

class FlaskCommandItem extends vscode.TreeItem {
  constructor(label: string, commandId?: string) {
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
