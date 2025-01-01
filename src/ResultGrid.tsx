import "react-data-grid/lib/styles.css";
import "./ResultGrid.css";

import DataGrid, { SelectColumn } from "react-data-grid";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { SearchResult } from "./SearchResult";

function ResultGrid({
  rows,
  search,
}: {
  rows: SearchResult[];
  search: string;
}) {
  const [selectedRows, setSelectedRows] = useState(
    (): ReadonlySet<string> => new Set()
  );

  function rowKeyGetter(row: SearchResult) {
    return row.path + row.name;
  }
  const columns = [
    SelectColumn,
    { key: "path", name: "路径" },
    {
      key: "name",
      name: "文件名",
    },
    { key: "ext", name: "后缀名", width: "80px" },
    {
      key: "content",
      name: "内容",
  
      renderCell: ({ row }: {row: SearchResult}) => {
        return (
          <div style={{ maxWidth: "300px" }}>
            <Highlighter
              highlightClassName="highlight-content"
              searchWords={[search]}
              autoEscape={true}
              textToHighlight={row.content}
            />
          </div>
        );
      },
    },
    {
      key: "tags",
      name: "标签",
      renderCell: ({ row }: any) => (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", width: "400px" }}>
          {row.tags.map((tag: string, index: number) => (
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

  return (
    <DataGrid
    style={{height: "100%"}}
      columns={columns}
      rows={rows}
      rowKeyGetter={rowKeyGetter}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
    />
  );
}

export { ResultGrid };
