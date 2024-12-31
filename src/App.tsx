import { useState } from "react";
import "./App.css";

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
    let res: string = ""
    try {
      res = await window.electronAPI.searchPy(text);
    } catch (error) {
      console.log("error searching", error);
    } finally {
      $searchingPy(false);
    }
    $searchResultPy(res);
  }

  return (
    <>
      <form onSubmit={handleSearch}>
        <input value={text} onChange={(ev) => $text(ev.target.value)}></input>
        <button type="submit">搜索</button>
        {searching && 
        <div style={{height: "64px"}}>
          <div className="loader"></div></div>}
      </form>
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
    </>
  );
}

export default App;
