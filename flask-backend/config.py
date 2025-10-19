import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # LLM Configuration
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama").lower()
    
    # Ollama Configuration  
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "deepseek-r1:8b")
    OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text")
    
    # Embedding Configuration
    EMBED_PROVIDER = os.getenv("EMBED_PROVIDER", "hf").lower()  # hf | ollama | gemini
    HF_EMBED_MODEL = os.getenv("HF_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    
    # Gemini Configuration
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-1.5-pro")
    GEMINI_EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "text-embedding-004")

    # Groq Configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", None)  # Your Groq API key
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # Market Data APIs
    INDIANAPI_BASE = os.getenv("INDIANAPI_BASE", "https://stock.indianapi.in")
    INDIANAPI_KEY = os.getenv("INDIANAPI_KEY")

    # Cache Configuration (in seconds)
    CACHE_TTL_QUOTES = int(os.getenv("CACHE_TTL_QUOTES", "60"))
    CACHE_TTL_CORPORATE = int(os.getenv("CACHE_TTL_CORPORATE", "900"))
    CACHE_TTL_FORECASTS = int(os.getenv("CACHE_TTL_FORECASTS", "300"))

    # Vector Database
    VECTOR_DB_DIR = os.getenv("VECTOR_DB_DIR", "./.chroma")
    
    # LLM Parameters
    CHAT_TEMPERATURE = float(os.getenv("CHAT_TEMPERATURE", "0.3"))
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2000"))  # Increased for better responses
    
    # RAG Configuration
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1200"))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))
    RETRIEVAL_K = int(os.getenv("RETRIEVAL_K", "6"))  # Number of documents to retrieve

    ENV = os.getenv("ENV", "PROD")

    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "advisor-kg")
    EMBED_DIM = int(os.getenv("EMBED_DIM", "768")) 
    EMBED_METRIC = os.getenv("EMBED_METRIC", "cosine")
    EMBED_BATCH_SIZE = int(os.getenv("EMBED_BATCH_SIZE", "512"))
    
    @classmethod
    def validate_config(cls):
        """Validate critical configuration"""
        issues = []
        
        if cls.LLM_PROVIDER == "ollama" and not cls.OLLAMA_BASE_URL:
            issues.append("OLLAMA_BASE_URL is required when using ollama provider")
            
        if cls.LLM_PROVIDER == "gemini" and not cls.GOOGLE_API_KEY:
            issues.append("GOOGLE_API_KEY is required when using gemini provider")
            
        if not os.path.exists(cls.VECTOR_DB_DIR):
            try:
                os.makedirs(cls.VECTOR_DB_DIR, exist_ok=True)
            except Exception as e:
                issues.append(f"Cannot create vector database directory: {e}")
        
        if issues:
            raise ValueError("Configuration issues: " + "; ".join(issues))
        
        return True
