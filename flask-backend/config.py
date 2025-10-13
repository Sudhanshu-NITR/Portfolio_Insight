import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # LLM provider
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama").lower()
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "deepseek-r1:8b")
    OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
    EMBED_PROVIDER = os.getenv("EMBED_PROVIDER", "hf").lower()  # hf | ollama | gemini
    HF_EMBED_MODEL = os.getenv("HF_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-1.5-pro")
    GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "text-embedding-004")

    # Market APIs
    INDIANAPI_BASE = os.getenv("INDIANAPI_BASE", "https://stock.indianapi.in")
    INDIANAPI_KEY = os.getenv("INDIANAPI_KEY")

    # Cache TTLs (seconds)
    CACHE_TTL_QUOTES = int(os.getenv("CACHE_TTL_QUOTES", "60"))
    CACHE_TTL_CORPORATE = int(os.getenv("CACHE_TTL_CORPORATE", "900"))
    CACHE_TTL_FORECASTS = int(os.getenv("CACHE_TTL_FORECASTS", "300"))

    # Vector store
    VECTOR_DB_DIR = os.getenv("VECTOR_DB_DIR", "./.chroma")

    # LLM params
    CHAT_TEMPERATURE = float(os.getenv("CHAT_TEMPERATURE", "0.2"))
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1500"))
