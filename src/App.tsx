import { useState } from "react";
import "./App.css";
import { ResultGrid } from "./ResultGrid";
import { IndexerStatusBar } from "./IndexerStatusBar";
import { SearchResult } from "./SearchResult";

declare global {
  interface Window {
    electronAPI: {
      searchByFilename: (path: string, text: string) => Promise<SearchResult[]>;
      searchPy: (
        text: string,
        afterDate: string,
        beforeDate: string
      ) => Promise<string>;
      onUpdateIndexerStatusBar: (callback: (msg: string) => void) => () => void;
    };
  }
}

function App() {
  const [text, $text] = useState("");

  const [searchResult, $searchResult] = useState<SearchResult[]>([]);

  const [searching, $searching] = useState<boolean>(false);

  const [afterDate, $afterDate] = useState("2024-01-01");
  const [beforeDate, $beforeDate] = useState("2025-02-01");

  // 显示高级选项
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch: React.MouseEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();

    $searching(true);
    let live: SearchResult[] = [];
    try {
      let res = await window.electronAPI.searchPy(text, afterDate, beforeDate);
      live = JSON.parse(res);
      console.log("search result", live);
      $searchResult(live);
    } catch (error) {
      console.log("error searching", error);
    } finally {
      $searching(false);
    }
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
            {searching ? <div className="loader"></div> : "搜索"}
          </button>
        </div>
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
              <input
                type="date"
                value={afterDate}
                onChange={(ev) => $afterDate(ev.target.value)}
              />
              <span>至</span>
              <input
                type="date"
                value={beforeDate}
                onChange={(ev) => $beforeDate(ev.target.value)}
              />
            </div>
            <div className="option" style={{ display: "flex" }}>
              <label style={{ paddingRight: "8px" }}>文件类型:</label>
              <label style={{ paddingRight: "8px" }}>
                <input type="checkbox" checked disabled></input>.txt
              </label>
              <label style={{ paddingRight: "8px" }}>
                <input type="checkbox" checked disabled></input>.docx
              </label>
              <label style={{ paddingRight: "8px" }}>
                <input type="checkbox" checked disabled></input>.pdf
              </label>
            </div>
          </div>
        )}
      </div>
      <div style={{ height: "8px" }}></div>
      {searchResult.length > 0 && (
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
          找到了 <span style={{ color: "#4299e1" }}>{searchResult.length}</span>{" "}
          个结果
        </div>
      )}
      <div style={{ height: "calc(100vh - 200px)" }}>
        <ResultGrid rows={searchResult} search={text}></ResultGrid>
      </div>
      {/* <table>
        <tbody>
          {searchResult.map((x) => (
            <tr key={x.fullPath}>
              <td>{x.fullPath}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
      {/* {searchResultPy} */}
      <IndexerStatusBar />
    </>
  );
}

export default App;
