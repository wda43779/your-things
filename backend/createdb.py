import sqlite3
import os
from constants import DB_PATH 

ddl = """
-- Filename: script.sql
-- Author: wjw
-- Description: data base data definition language
CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tag JSON
);
CREATE TABLE words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(255) NOT NULL
);
CREATE TABLE re_sort (
    file_id INT,
    word_id INT,
    PRIMARY KEY (file_id, word_id)
);
"""

def create_db():
    con = sqlite3.connect(DB_PATH)
    print(DB_PATH)
    cur = con.cursor()
    sql_script = ddl
    sql_statements = [statement.strip() for statement in sql_script.split(';') if statement.strip()]
    for statement in sql_statements:
        cur.execute(statement)
    con.commit()
    con.close()

if __name__ == "__main__":
    create_db()
