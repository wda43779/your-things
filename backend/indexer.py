import sys
import sqlite3
from constants import DB_PATH

from wjw import query_by_word


def indexer(path):
    con = sqlite3.connect(DB_PATH)
    print(query_by_word(con, text))


if __name__ == "__main__":
    indexer(path)