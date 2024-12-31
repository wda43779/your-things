import sys
import sqlite3
from constants import DB_PATH

from wjw import query_by_word


def search(text):
    con = sqlite3.connect(DB_PATH)
    print(query_by_word(con, text))


if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = sys.argv[1]
        search(text)
