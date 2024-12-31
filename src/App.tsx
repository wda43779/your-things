import { useState } from "react";
import "./App.css";

declare global {
  interface Window {
    electronAPI: {
      searchByFilename: (path: string, text: string) => Promise<FileResult[]>;
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

  const [searchProcess, $searchProcess] = useState<string>("");

  const handleSearch: React.MouseEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    let res = await window.electronAPI.searchByFilename(".", text);
    console.log("ipc", res);
    $searchResult(res);
  };

  return (
    <>
      <form onSubmit={handleSearch}>
        <input value={text} onChange={(ev) => $text(ev.target.value)}></input>
        <button type="submit">搜索</button>
      </form>
      {searchProcess && <div>正在搜索： {searchProcess}</div>}
      <table>
        <tbody>
          {searchResult.map((x) => (
            <tr key={x.fullPath}>
              <td>{x.fullPath}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
