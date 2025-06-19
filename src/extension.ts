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
      const terminal = vscode.window.createTerminal("Flask RUN APP");
      terminal.show();
      terminal.sendText(cmd);
      vscode.window.showInformationMessage(msg);
    };

    const initFlaskProject = () => {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders) return;

      const rootPath = folders[0].uri.fsPath;
      const modelPath = context.asAbsolutePath('src/modelos');

      // Cria diretórios padrão
      vscode.window.showInformationMessage('Criando estrutura de projeto Flask...');
      ['app', 'routes', 'templates', 'static'].forEach(dir => {
        const fullPath = path.join(rootPath, dir);
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
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
    };

    let treeProvider: flaskRunAppProvider;
    treeProvider = new flaskRunAppProvider();
    vscode.window.registerTreeDataProvider(
      'flaskRunAppView',
      treeProvider
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('flaskRunApp.createVenv', () => {
        const cmd = vscode.workspace.getConfiguration().get<string>('flaskHelper.createVenv') || 'python -m venv venv';
        runCommand(cmd, 'Criando ambiente virtual...');
      }),
      vscode.commands.registerCommand('flaskRunApp.installReqs', () => {
        const cmd = vscode.workspace.getConfiguration().get<string>('flaskHelper.installReqs') || 'venv\\Scripts\\pip install -r requirements.txt';
        runCommand(cmd, 'Instalando requirements...');
      }),
      vscode.commands.registerCommand('flaskRunApp.runFlask', () => {
        const cmd = vscode.workspace.getConfiguration().get<string>('flaskHelper.runFlask') || 'venv\\Scripts\\python run.py';
        runCommand(cmd, 'Iniciando Flask App...');
      }),
      vscode.commands.registerCommand('flaskRunApp.installFlask', () => {
        runCommand('pip install flask', 'Instalando Flask...');
      }),
      vscode.commands.registerCommand('flaskRunApp.initFlaskProject', initFlaskProject)
    );
  });
}

class flaskRunAppProvider implements vscode.TreeDataProvider<FlaskCommandItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FlaskCommandItem | undefined | void> = new vscode.EventEmitter<FlaskCommandItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<FlaskCommandItem | undefined | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FlaskCommandItem): vscode.TreeItem {
    return element;
  }

  getChildren(): FlaskCommandItem[] {
    if (!isPythonFlaskProject) {
      return [
        new FlaskCommandItem('✨ Iniciar nova aplicação Flask', 'flaskRunApp.initFlaskProject'),
        new FlaskCommandItem('🔧 Instalar Flask', 'flaskRunApp.installFlask')
      ];
    }

    return [
      new FlaskCommandItem('🐍 Criar venv', 'flaskRunApp.createVenv'),
      new FlaskCommandItem('📦 Instalar requirements', 'flaskRunApp.installReqs'),
      new FlaskCommandItem('🚀 Rodar Flask App', 'flaskRunApp.runFlask'),
      new FlaskCommandItem('🔧 Instalar Flask', 'flaskRunApp.installFlask')
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