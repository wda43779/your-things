# Filename: search_by_vec.py
# Author: lyq
# Description: make faiss index and save to database


import jieba
import faiss
import numpy as np
import os

# 对查询文本进行向量化
def vectorize_query(query):
    """
    将查询文本向量化。
    - 使用 jieba 对中文文本进行分词。
    - 使用预训练的 BERT 模型将分词后的文本向量化。
    返回：
        - query_vector: 向量化的查询（numpy 数组）。
    """
    # 使用 jieba 对中文文本进行分词
    tokenized_text = ' '.join(jieba.cut(query))
    
    # 加载预训练的 BERT 分词器和模型
    tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")
    model = AutoModel.from_pretrained("bert-base-chinese")
    
    # 对分词后的文本进行编码，支持 truncation 和 padding
    tokenized_query = tokenizer(tokenized_text, return_tensors="pt", truncation=True, padding=True)
    
    # 将 BERT 输出的 last_hidden_state 的平均值作为文本向量
    query_vector = model(**tokenized_query).last_hidden_state.mean(dim=1).squeeze().detach().numpy()
    
    return query_vector


# 将文档内容向量化并存入（或追加到）FAISS索引文件
def vectorize_and_save(document_text, faiss_index_path):
    """
    对文档内容向量化，并将向量存入 FAISS 索引文件。
    - 如果索引文件存在，则加载索引并追加新向量。
    - 如果索引文件不存在，则创建一个新的索引。
    参数：
        - document_text: 待向量化的文档内容（字符串）。
        - faiss_index_path: FAISS 索引文件路径。
    返回：
        - ntotal: 索引中向量的总数量。
    """
    # 将文档内容向量化
    document_vector = vectorize_query(document_text)
    
    # 检查 FAISS 索引文件是否存在
    if os.path.exists(faiss_index_path):
        # 如果索引文件存在，加载已有的索引
        index_file = faiss.read_index(faiss_index_path)
    else:
        # 如果索引文件不存在，创建一个新的索引
        # 使用 L2 范数（欧氏距离）进行索引
        index_file = faiss.IndexFlatL2(document_vector.shape[0])  # 维度为向量的大小

    # 将新向量添加到索引中
    index_file.add(np.array([document_vector]))  # FAISS 要求输入为二维数组

    # 保存更新后的索引到指定路径
    faiss.write_index(index_file, faiss_index_path)

    # 返回索引中当前向量的总数
    return index_file.ntotal


# 使用 FAISS 索引进行查询
def search_faiss(query, faiss_index_path, indices):
    """
    在 FAISS 索引中执行查询，仅查询指定的索引范围（子集）。
    - 通过传入的索引范围参数 `indices`，创建子索引。
    - 在子索引中执行最近邻搜索。
    参数：
        - query: 查询的文本（字符串）。
        - faiss_index_path: 原始索引文件路径。
        - indices: 要查询的子索引范围（列表，表示索引位置）。
    返回：
        - D: 查询到的最近邻向量的距离（二维数组）。
        - I: 查询到的最近邻向量的索引（二维数组）。
    """
    # 加载原始索引文件
    index_file = faiss.read_index(faiss_index_path)
    
    # 从原始索引中提取指定的向量，构建子集
    # `index_file.reconstruct(i)` 用于提取索引 i 对应的向量
    selected_vectors = np.array([index_file.reconstruct(i) for i in indices])

    # 创建一个新的子索引（L2 范数索引），维度与原始索引一致
    sub_index = faiss.IndexFlatL2(index_file.d)  # `index_file.d` 是索引的向量维度
    sub_index.add(selected_vectors)  # 将选中的向量添加到子索引

    # 将查询文本向量化
    query_vector = vectorize_query(query)

    # 在子索引中执行查询
    # 需要传入查询向量（二维数组）和最近邻数量 k
    D, I = sub_index.search(np.array([query_vector]), k=5)  # 默认查询最近 5 个

    return D, I

## 创建文件的SQL索引时同时创建其FAISS索引
## SQL先进行硬性条件搜索，如日期、名称、标签等，然后将查到的index以及用户问题原话传进查询函数
## 然后将FAISS查到的内容作为输出，解决的是自然语言模糊或口语化的问题。FAISS会按顺序输出语义最接近的结果。
