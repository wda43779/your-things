import "react-data-grid/lib/styles.css";
import "./ResultGrid.css";

import DataGrid, { SelectColumn } from "react-data-grid";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { SearchResult } from "./SearchResult";

const columns = [
  SelectColumn,
  { key: "path", name: "路径" },
  {
    key: "name",
    name: "文件名",
  },
  { key: "ext", name: "后缀名" },
  {
    key: "content",
    name: "内容",
    renderCell: ({ row }) => {
      return (
        <Highlighter
          highlightClassName="highlight-content"
          searchWords={["web"]}
          autoEscape={true}
          textToHighlight={row.content}
        />
      );
    },
  },
  {
    key: "tags",
    name: "标签",
    renderCell: ({ row }: any) => (
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {row.tags.map((tag, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#e2e8f0",
              borderRadius: "12px",
              padding: "4px 8px",
              fontSize: "12px",
              color: "#4a5568",
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    ),
  },
];

const rows: SearchResult[] = [
  {
    path: `C:\\Users\\wda43779\\code\\your-things\\test\\electron.txt`,
    name: "electron.txt",
    ext: "txt",
    content: `
webpack Playwright Testing Library
`,
    createTime: "2024-12-31",
    updateTime: "2024-12-31",
    tags: ["electron", "webpack", "logo"],
  },
  {
    path: `C:\\Users\\wda43779\\code\\your-things\\test\\react.txt`,
    name: "react.txt",
    ext: "txt",
    content: `The library for web and native user interfaces
`,
    createTime: "2024-12-31",
    updateTime: "2024-12-31",
    tags: ["react", "user", "interfaces"],
  },
];

function ResultGrid({ rows }: { rows: SearchResult[] }) {
  const [selectedRows, setSelectedRows] = useState(
    (): ReadonlySet<string> => new Set()
  );

  function rowKeyGetter(row: SearchResult) {
    return row.path + row.name;
  }

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      rowKeyGetter={rowKeyGetter}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
    />
  );
}

export { ResultGrid };
