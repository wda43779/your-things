import os
import json
import sys
import sqlite3
from constants import DB_PATH


def query_by_words(connection, words: str) -> list[dict]:
    cursor: Cursor = connection.cursor()

    word_list = words.split(" ")
    file_id_sets = []

    for word in word_list:
        cursor.execute(
            """
            SELECT re_sort.file_id
            FROM re_sort
            WHERE re_sort.word_id IN (
                SELECT words.id
                FROM words
                WHERE words.word = ?
            )
            """,
            (word,),
        )
        # 将查询结果转换为集合
        file_ids = {row[0] for row in cursor.fetchall()}
        file_id_sets.append(file_ids)

    common_file_ids = set.union(*file_id_sets) if file_id_sets else set()

    if not common_file_ids:
        print("[]")
        return
    
    # 查询交集文件 ID 对应的文件信息
    cursor.execute(
        """
        SELECT files.file_path, files.file_name, files.file_type, files.create_time, files.update_time, files.tag
        FROM files
        WHERE files.id IN ({})
        """.format(",".join("?" * len(common_file_ids))),
        tuple(common_file_ids),
    )
    result = cursor.fetchall()

    search_results = []
    for row in result:
        file_loc = os.path.join(row[0])  # 构造文件的完整路径
        content = ""
        if os.path.exists(file_loc):  # 检查文件是否存在
            with open(file_loc, "r", encoding="utf-8") as file:
                content = file.read()  # 读取文件内容
        search_result = {
            "path": row[0],
            "name": row[1],
            "ext": row[2],
            "createTime": row[3],
            "updateTime": row[4],
            "tags": json.loads(row[5]) if row[5] else None,
            "content": content,
        }
        search_results.append(search_result)

    # 打印 JSON 结果
    print(json.dumps(search_results, indent=2))


def search(text):
    con = sqlite3.connect(DB_PATH)
    query_by_words(con, text)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = sys.argv[1]
        search(text)
