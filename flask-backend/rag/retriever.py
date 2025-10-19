from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from .llm import make_embedder
from config import Config
import os

def get_retriever():
    embeddings = make_embedder()
    pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
    index_name = os.getenv("PINECONE_INDEX_NAME", "advisor-kg")
    index = pc.Index(index_name)

    vs = PineconeVectorStore(index=index, embedding=embeddings)
    return vs.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 6, "fetch_k": 24, "lambda_mult": 0.5}
    )
