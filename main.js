const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  Notification,
  ipcMain,
} = require("electron/main");

const path = require("node:path");
const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");

const searchPy = (text) => {
  const pythonScriptPath = "path/to/your_script.py";

  const res = new Promise((resolve, reject) => {
    // 启动 Python 脚本
    let pythonLoc =
      process.platform === "win32"
        ? path.join(__dirname, "backend/env/Scripts/python.exe")
        : path.join(__dirname, "backend/env/bin/python");
    const pythonProcess = spawn(pythonLoc, ["backend/search.py", text]);

    let outputs = "";
    pythonProcess.stdout.on("data", (data) => {
      outputs += data;
    });

    let errors = "";
    pythonProcess.stderr.on("data", (data) => {
      errors += data;
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python script exited with code ${code}`);
      if (code === 0) {
        resolve(outputs);
      } else {
        reject(errors);
      }
    });
  });
  return res;
};

const indexPy = (text) => {
  const pythonScriptPath = "path/to/your_script.py";

  const res = new Promise((resolve, reject) => {
    // 启动 Python 脚本
    let pythonLoc =
      process.platform === "win32"
        ? path.join(__dirname, "backend/env/Scripts/python.exe")
        : path.join(__dirname, "backend/env/bin/python");
    const pythonProcess = spawn(pythonLoc, ["backend/index.py"]);

    let outputs = "";
    pythonProcess.stdout.on("data", (data) => {
      outputs += data;
    });

    let errors = "";
    pythonProcess.stderr.on("data", (data) => {
      errors += data;
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python script exited with code ${code}`);
      if (code === 0) {
        resolve(outputs);
      } else {
        reject(errors);
      }
    });
  });
  return res;
};


/**
 * 按照文件名搜索
 * @param {string} dirPath - 路径
 * @param {string} text - 文本
 * @returns {Promise<{filename: string, parentPath: string, fullPath: string}>}
 */
async function searchByFilename(dirPath, text) {
  const results = [];

  const searchDirectory = async (currentPath) => {
    const files = await fs.readdir(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);

      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await searchDirectory(filePath); // 递归搜索子目录
      } else if (file.includes(text)) {
        results.push({
          filename: file,
          parentPath: currentPath,
          fullPath: path.join(currentPath, file),
        });
      }
    }
  };

  await searchDirectory(dirPath);
  return results;
}

// 每秒启动索引
let index = 0;
let intervalId = 0;
function indexer() {
  intervalId = setInterval(() => {
    index++;
  }, 1000);
}
function exitIndexer() {
  clearInterval(intervalId);
}

let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.handle("search-by-filename", async (event, path, text) => {
    return await searchByFilename(path, text);
  });
  ipcMain.handle("search-py", async (event, text) => {
    return await searchPy(text);
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173/");
  } else {
    mainWindow.loadFile("index.html");
  }
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

let firstBackground = true;
const NOTIFICATION_TITLE = "Your Things 在后台运行索引服务呢！";
// const NOTIFICATION_BODY = "Your Things 在后台运行索引服务呢！";

function showNotification() {
  if (firstBackground) {
    new Notification({
      title: NOTIFICATION_TITLE,
      // body: NOTIFICATION_BODY,
    }).show();
  }
  firstBackground = false;
}

const gotTheLock = app.requestSingleInstanceLock();
console.log("no lock");
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });

  app.whenReady().then(() => {
    const icon = nativeImage.createFromPath(
      path.join(
        __dirname,
        process.env.NODE_ENV === "development" ? "public/tray.png" : "tray.png"
      )
    );
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "打开主界面",
        type: "normal",
        click: () => {
          createWindow();
        },
      },
      {
        label: "退出",
        type: "normal",
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip("This is my application");
    tray.setTitle("This is my title");
    tray.on("double-click", () => {
      createWindow();
    });

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    showNotification();
    // 全部窗口关闭时，保留托盘
    //if (process.platform !== 'darwin') {
    //  app.quit()
    //}
  });
}
