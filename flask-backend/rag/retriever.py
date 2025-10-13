from langchain_chroma import Chroma
from .llm import make_embedder
from config import Config

def get_retriever():
    db = Chroma(
        collection_name="advisor_kg",
        embedding_function=make_embedder(),
        persist_directory=Config.VECTOR_DB_DIR
    )
    return db.as_retriever(search_type="mmr", search_kwargs={"k": 6, "fetch_k": 24, "lambda_mult": 0.5})
