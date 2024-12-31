import { useState } from "react";
import "./App.css";
import { ResultGrid } from "./ResultGrid";
import { IndexerStatusBar } from "./IndexerStatusBar";

declare global {
  interface Window {
    electronAPI: {
      searchByFilename: (path: string, text: string) => Promise<FileResult[]>;
      searchPy: (text: string) => Promise<string>;
    };
  }
}

interface FileResult {
  filename: string;
  parentPath: string;
  fullPath: string;
}

function App() {
  const [text, $text] = useState("");

  const [searchResult, $searchResult] = useState<FileResult[]>([]);
  const [searchResultPy, $searchResultPy] = useState<string>("");

  // const [searchProcess, $searchProcess] = useState<string>("");
  const [searching, $searching] = useState<boolean>(false);
  const [searchingPy, $searchingPy] = useState<boolean>(false);

  // 高级选项
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch: React.MouseEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();

    searchPass2();

    $searching(true);
    let res: FileResult[] = [];
    try {
      res = await window.electronAPI.searchByFilename(".", text);
    } catch (error) {
      console.log("error searching", error);
    } finally {
      $searching(false);
    }

    $searchResult(res);
  };

  const searchPass2 = async () => {
    $searchingPy(true);
    let res: string = "";
    try {
      res = await window.electronAPI.searchPy(text);
    } catch (error) {
      console.log("error searching", error);
    } finally {
      $searchingPy(false);
    }
    $searchResultPy(res);
  };

  return (
    <>
      <form onSubmit={handleSearch}>
        <div className="search-container">
          <input
            value={text}
            onChange={(ev) => $text(ev.target.value)}
            type="text"
            placeholder="请输入搜索内容"
            className="search-input"
          />
          <button className="search-button" type="submit">
            搜索
          </button>
        </div>

        {searching && (
          <div style={{ height: "64px" }}>
            <div className="loader"></div>
          </div>
        )}
      </form>{" "}
      <div className="advanced-options-container">
        <button
          className="advanced-options-button"
          onClick={() => setIsOpen((x: boolean) => !x)}
        >
          高级选项 {isOpen ? "▲" : "▼"}
        </button>

        {isOpen && (
          <div className="options-panel">
            <div className="option">
              <label>日期范围:</label>
              <input type="date" />
              <span>至</span>
              <input type="date" />
            </div>
            <div className="option">
              <label>文件类型:</label>
              <select>
                <option value="all">全部</option>
                <option value="pdf">PDF</option>
                <option value="doc">Word</option>
                <option value="xls">Excel</option>
              </select>
            </div>
            <div className="option">
              <label>排序方式:</label>
              <select>
                <option value="relevance">相关性</option>
                <option value="date">日期</option>
                <option value="name">名称</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <div style={{ height: "8px"}}></div>
      <div
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#2d3748",
          backgroundColor: "#f7fafc",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "16px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        找到了 <span style={{ color: "#4299e1" }}>2</span> 个结果
      </div>
      <ResultGrid></ResultGrid>
      <table>
        <tbody>
          {searchResult.map((x) => (
            <tr key={x.fullPath}>
              <td>{x.fullPath}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {searchResultPy}
      <IndexerStatusBar />
    </>
  );
}

export default App;
