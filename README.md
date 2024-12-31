# Your things - a local file searcher gui with indexed full-text search

## Overview
`Your Things` is a powerful local file searcher GUI built using Electron RISC-V port, React, and React Data Grid. It combines advanced full-text search capabilities with efficient data persistence using SQLite. The application leverages BERT and FAISS for natural language processing and ranking, providing users with a seamless and intelligent search experience.

## Key Features

### 1. Electron RISC-V Port + React + React Data Grid GUI
- **Electron RISC-V Port**:  The application is built on Electron, ported to RISC-V architecture (https://github.com/riscv-forks/electron), ensuring cross-platform compatibility and performance optimization for RISC-V systems.
- **React**: The user interface is developed using React, providing a responsive and dynamic user experience.
- **React Data Grid**: The search results are displayed in a highly customizable and interactive data grid, allowing users to sort, filter, and manage their search results efficiently.

### 2. Full-Text Inverted Index + SQLite Data Persistence
- **Full-Text Inverted Index**: The application employs a full-text inverted index to enable fast and accurate search across local files. This indexing mechanism ensures that search queries are processed quickly, even with large datasets.
- **SQLite Data Persistence**: All indexed data and search metadata are stored in an SQLite database, ensuring reliable and efficient data persistence. SQLite's lightweight nature makes it ideal for local file search applications.

### 3. BERT + FAISS for Natural Language Processing and Ranking
- **BERT**: The application utilizes BERT (Bidirectional Encoder Representations from Transformers) for natural language understanding, enabling it to interpret complex search queries and provide relevant results.
- **FAISS**: FAISS (Facebook AI Similarity Search) is used for efficient similarity search and ranking of search results. This ensures that the most relevant files are presented to the user based on the context of their query.

## Conclusion
Your Things is a cutting-edge local file searcher that combines the power of Electron, React, and advanced NLP techniques to deliver a fast, accurate, and user-friendly search experience. Whether you're searching through large datasets or looking for specific files, Your Things is designed to meet your needs with precision and efficiency.
