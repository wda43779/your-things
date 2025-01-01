import sys
import sqlite3
from constants import DB_PATH

from wjw import get_all_files, words_and_re_sort
from createdb import create_db
import os


def indexer():
    if not os.path.exists(DB_PATH):
        create_db()  # 如果文件不存在，则调用 createdb 函数创建数据库
    con = sqlite3.connect(DB_PATH)
    files_content = get_all_files(con, ".")
    words_and_re_sort(con, files_content, )
    con.close()


if __name__ == "__main__":
    indexer()