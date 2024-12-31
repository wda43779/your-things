import { useEffect, useState } from "react";
import "./IndexerStatusBar.css"

const IndexerStatusBar = () => {
  const [folderPath, setFolderPath] = useState("C:/Users/Example/Documents");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFolderPath((prevPath) => prevPath + "/subfolder");
      setProgress((prevProgress) => (prevProgress < 100 ? prevProgress + 10 : 0));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-bar">
      <div>
        正在索引 <span className="folder-path">{folderPath}</span> 文件夹
      </div>
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
export { IndexerStatusBar };
