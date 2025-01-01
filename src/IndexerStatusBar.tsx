import { useEffect, useState } from "react";
import "./IndexerStatusBar.css"
import { SearchResult } from "./SearchResult";

declare global {
  interface Window {
    electronAPI: {
      searchByFilename: (path: string, text: string) => Promise<SearchResult[]>;
      searchPy: (text: string, afterDate: string, beforeDate: string) => Promise<string>;
      onUpdateIndexerStatusBar: (callback: (msg: string) => void) => () => void;
    };
  }
}


const IndexerStatusBar = () => {
  const [msg, $msg] = useState("索引完成");

  useEffect(() => {
    let cancel = window.electronAPI.onUpdateIndexerStatusBar((msg) => {
      $msg(msg);
    });
    return () => {
      cancel();
    }
  }, []);


  return (
    <>
    <div style={{height: "60px"}}></div>
    <div style={{ position: "relative"}}>
      <div className="status-bar">
      <div>
        {msg}
      </div>
    </div>
    </div>
    </>
  );
};
export { IndexerStatusBar };
