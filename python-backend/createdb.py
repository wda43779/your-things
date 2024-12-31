import sqlite3
import os
from .constants import DB_PATH 

SQL_FILE_PATH = 'ddl.sql'

def create_db():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    with open(SQL_FILE_PATH, 'r') as file:
        sql_script = file.read()
        sql_statements = [statement.strip() for statement in sql_script.split(';') if statement.strip()]
        for statement in sql_statements:
            cur.execute(statement)
    con.commit()
    con.close()