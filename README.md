# 🚀 Flask Helper – Extensão para VSCode

**Flask Helper** é uma extensão para Visual Studio Code que adiciona uma aba lateral com botões úteis para projetos Python com Flask.  
Ela automatiza ações comuns como:

- 🐍 Criar um ambiente virtual (`venv`)
- 📦 Instalar dependências do `requirements.txt`
- 🚀 Iniciar o app Flask com um clique

> A extensão só será exibida em projetos Python, detectando arquivos como `requirements.txt`, `setup.py`, `pyproject.toml` ou `.py`.

---

## ⚙️ Instalação Local

Siga os passos abaixo para instalar a extensão localmente no seu VSCode:

### 1. Clone ou copie os arquivos da extensão

```bash
git clone https://github.com/seu-usuario/flask-helper-ext.git
cd flask-helper-ext
```

> 📁 Certifique-se de que o projeto contém `src/extension.ts`, `package.json` e `tsconfig.json`.

---

### 2. Instale as dependências

```bash
npm install
```

Se ainda não tiver, instale o pacote `vsce` globalmente:

```bash
npm install -g vsce
```

---

### 3. Compile o TypeScript (gera a pasta `dist`)

```bash
npx tsc
```

---

### 4. Gere o pacote `.vsix`

```bash
vsce package
```

Isso criará um arquivo `.vsix`, exemplo:

```
flask-helper-1.0.0.vsix
```

---

### 5. Instale a extensão no VSCode

Via terminal:

```bash
code --install-extension flask-helper-1.0.0.vsix
```

Ou:

1. Abra o VSCode
2. `Ctrl+Shift+P` → "Install from VSIX"
3. Selecione o `.vsix` gerado

---

## 🧪 Testando a extensão em modo de desenvolvimento

Se quiser testar durante o desenvolvimento:

1. Abra a pasta da extensão no VSCode
2. Pressione `F5` para abrir uma nova janela com a extensão carregada
3. A aba lateral “Flask Helper” deve aparecer (em projetos Python)

---

## 🐍 Requisitos

- Python instalado e disponível no `PATH`
- Projeto com arquivos como:
  - `requirements.txt`
  - `setup.py`
  - `pyproject.toml`
  - `.py`

---

## 💡 Sugestões ou melhorias?

Sinta-se à vontade para abrir uma issue ou contribuir com PRs. Vamos deixar o mundo Flask mais rápido e simples! 😄

---

**Feito por [DEIVID GUSTAVO MATTOS]**