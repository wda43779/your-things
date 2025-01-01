# Filename: wjw.py
# Author: wjw
# Description: make index and save to database

import json
import os
from pathlib import Path
from datetime import datetime
import jieba
import jieba.analyse
import re
import sqlite3

from constants import DB_PATH


# 获取所有的文件信息(不包括文件内容),并写入数据库
def get_all_files(connection: sqlite3.Connection,path):
    cursor = connection.cursor()

    cursor.execute("DELETE FROM files")
    cursor.execute("DELETE FROM words")
    cursor.execute("DELETE FROM re_sort")

    # 定义要搜索的文件类型
    file_types = {'.txt', '.docx', '.pdf'}

    # 定义文件的路径
    d_drive_path = Path(path)

    # 定义一个字典列表来存储文件信息，将列表信息写入数据库。
    files_info = []
    files_content = []
    id = 0
    for file_path in d_drive_path.rglob('*'):
        if id % 100 == 0:
            print("indexing: ", file_path)
        # 检查是否是文件以及文件扩展名是否是我们想要的类型
        if file_path.is_file() and file_path.suffix.lower() in file_types:

            file_info = os.stat(file_path)

            # 文件内容,不会写入数据库
            with open(file_path, 'r', encoding='utf-8') as file:
                file_content = file.read(10000)
            files_content.append(file_content)

            # id
            id = id + 1
            # 文件路径
            file_path_str = str(file_path)
            # 文件名
            file_name = file_path.name
            # 文件类型
            file_type = file_path.suffix
            # 创建日期
            create_time = datetime.fromtimestamp(file_info.st_ctime).strftime('%Y-%m-%d %H:%M:%S')
            # 修改日期
            updated_time = datetime.fromtimestamp(file_info.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
            # 标签,通过jieba生成
            tag: list[str] = jieba.analyse.extract_tags(file_content, topK=5)

            # 将信息添加到列表中
            files_info.append({
                'id': id,
                'file_name': file_name,
                'file_type': file_type,
                'file_path': file_path_str,
                'create_time': create_time,
                'update_time': updated_time,
                'tag':tag
            })
    print('write files mate data to database')
    insert_template = "insert into files (id,file_name,file_type,file_path,create_time,update_time,tag) values (?,?,?,?,?,?,?);"
    for file_info in files_info:
        cursor.execute(insert_template,
                       (file_info['id'],
                        file_info['file_name'],
                        file_info['file_type'],
                        file_info['file_path'],
                        file_info['create_time'],
                        file_info['update_time'],
                        json.dumps(file_info['tag'],ensure_ascii=False)
                        ))
    connection.commit()
    cursor.close()
    print('write files mate data to database done')
    return files_content
    # words_and_re_sort(connection, files_content):




# 生成词典和倒排序结构
def words_and_re_sort(connection: sqlite3.Connection, files_content):
    seg_lists = []
    word_list = set()
    print("creating re sort structure")
    for content in files_content:
        seg_list = jieba.cut(content,cut_all=False) # 精确模式,并过滤掉标点空格和字符
        filtered_seg_list = [re.sub(r'[^\w]+', '', i) for i in seg_list if i.strip()]
        seg_lists.append(filtered_seg_list)

    # 将所有的单词无重复写入列表
    for seg_list in seg_lists:
        for word1 in seg_list:
            word_list.add(word1)

    # 生成词典
    print("writing index to database")
    cursor: Cursor = connection.cursor()

    id_word = 0
    for word2 in word_list:
        id_word = id_word + 1
        cursor.execute('insert into words (id,word) values (?,?)',(id_word,word2))
    # 生成倒排索引(file_id,word_id)
    file_id: int = 0
    for seg_list in seg_lists:
        file_id:int = file_id + 1
        for word3 in seg_list:
            # print(word3)
            cursor.execute('select id from words where word = ?',(word3,))
 
            word_id = cursor.fetchone()[0]
 
            # print("word_id=", word_id)
            # print("word3=", word3)
            # print("file_id=", file_id)
            cursor.execute('insert into re_sort (file_id,word_id) values (?,?) ON CONFLICT (file_id,word_id) DO NOTHING',(file_id,word_id))

    connection.commit()
    cursor.close()
    print("writing index to database done")




# query by word
# query by tag
# query by file_name
# query by file_type
# query by create_time
# query by update_time
# query by AI
def query_by_word(connection,word):
    cursor: Cursor = connection.cursor()
    cursor.execute('select files.* from files where files.id in '
                   '(select re_sort.file_id from re_sort where re_sort.word_id in '
                   '(select words.id from words where words.word = (?)))',(word, ))
    result = cursor.fetchall()
    return result
def query_by_tag(connection,tag):
    cursor: Cursor = connection.cursor()
    cursor.execute('select * from files where JSON_CONTAINS(tag, (%s))',tag)
    result = cursor.fetchall()
    return result
def query_by_file_name(connection,file_name):
    cursor: Cursor = connection.cursor()
    cursor.execute('select * from files where file_name = (%s)',file_name)
    result = cursor.fetchall()
    return result
def query_by_file_type(connection,file_type):
    cursor: Cursor = connection.cursor()
    cursor.execute('select * from files where file_type = (%s)',file_type)
    result = cursor.fetchall()
    return result
def query_by_create_time(connection,create_time_begin,create_time_dl):
    cursor: Cursor = connection.cursor()
    cursor.execute('select * from files where create_time between (%s) and (%s)',(create_time_begin,create_time_dl))
    result = cursor.fetchall()
    return result
def query_by_update_time(connection,update_time_begin,update_time_dl):
    cursor: Cursor = connection.cursor()
    cursor.execute('select * from files where update_time between (%s) and (%s)',(update_time_begin,update_time_dl))
    result = cursor.fetchall()
    return result




def search_test():
    con = sqlite3.connect(DB_PATH)
    print(query_by_word(con,word='一下站'))
    # print(query_by_tag(connection,tag='"算法"'))
    # print(query_by_file_name(connection,file_name='1.txt'))
    # print(query_by_file_type(connection,file_type='.txt'))
    # print(query_by_create_time(connection,create_time_begin=datetime(2024,12,20),create_time_dl=datetime(2024,12,24)))
    # print(query_by_update_time(connection,update_time_begin=datetime(2024,12,20),update_time_dl=datetime(2024,12,30)))
    con.close()
    


if __name__ == '__main__':
    pass
    # search_test()

