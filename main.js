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
const readline = require("node:readline");
const electron = require("electron");

app.getFileIcon = (path) => {
  return nativeImage.createFromPath(path);
};

const searchPy = (text, afterDate, beforeDate) => {
  const res = new Promise((resolve, reject) => {
    // 启动 Python 脚本
    let pythonLoc =
      process.platform === "win32"
        ? path.join(__dirname, "backend/env/Scripts/python.exe")
        : "./backend/env/bin/python";
    console.log("searchpy=", text, afterDate, beforeDate);
    const pythonProcess = spawn(pythonLoc, [
      "backend/search.py",
      text,
      afterDate,
      beforeDate,
    ]);

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

const indexPy = () => {
  const res = new Promise((resolve, reject) => {
    // 启动 Python 脚本
    let pythonLoc =
      process.platform === "win32"
        ? path.join(__dirname, "backend/env/Scripts/python.exe")
        : "./backend/env/bin/python";
    const pythonProcess = spawn(pythonLoc, ["backend/indexer.py"]);
    const rl = readline.createInterface({
      input: pythonProcess.stdout,
      output: process.stdout,
      terminal: false,
    });

    let outputs = "";
    rl.on("line", (line) => {
      mainWindow?.webContents.send("indexer-status-bar", line);
      console.log(`py out: ${line}`);
      outputs += line + "\n";
    });

    let errors = "";
    pythonProcess.stderr.on("data", (data) => {
      console.log(data.toString());
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
  // const results = [];

  // const searchDirectory = async (currentPath) => {
  //   const files = await fs.readdir(currentPath);

  //   for (const file of files) {
  //     const filePath = path.join(currentPath, file);

  //     const stat = await fs.stat(filePath);
  //     if (stat.isDirectory()) {
  //       await searchDirectory(filePath); // 递归搜索子目录
  //     } else if (file.includes(text)) {
  //       results.push({
  //         path: currentPath,
  //         name: file,
  //         ext: path.extname(file),
  //         content: await (fs.readFile(filePath, 'utf8'))[100],
  //         createTime: stat.birthtime,
  //         updateTime: stat.mtime,
  //         tags: [],
  //       });
  //     }
  //   }
  // };

  // await searchDirectory(dirPath);
  // return results;
  return [];
}

// 每10分钟启动索引
let intervalId = 0;
function indexer() {
  intervalId = setInterval(() => {
    mainWindow?.webContents.send("indexer-status-bar", "开始索引");
    indexPy();
    mainWindow?.webContents.send("indexer-status-bar", "索引完成");
  }, 10* 60 * 1000);
}
function exitIndexer() {
  clearInterval(intervalId);
}

indexer();

ipcMain.handle("search-by-filename", async (event, path, text) => {
  return await searchByFilename(path, text);
});
ipcMain.handle("search-py", async (event, text, afterDate, beforeDate) => {
  return await searchPy(text, afterDate, beforeDate);
});

let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173/");
  } else {
    mainWindow.loadFile("index.html");
  }
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
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
