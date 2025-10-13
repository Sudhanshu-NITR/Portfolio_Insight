from config import Config

def make_chat_llm():
    if Config.LLM_PROVIDER == "ollama":
        from langchain_ollama import ChatOllama
        return ChatOllama(model=Config.OLLAMA_CHAT_MODEL, base_url=Config.OLLAMA_BASE_URL, temperature=Config.CHAT_TEMPERATURE)
    elif Config.LLM_PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(model=Config.GEMINI_CHAT_MODEL, google_api_key=Config.GOOGLE_API_KEY, temperature=Config.CHAT_TEMPERATURE)
    raise ValueError("Unsupported LLM_PROVIDER")

def make_embedder():
    if Config.EMBED_PROVIDER == "hf":
        from langchain_huggingface import HuggingFaceEmbeddings  # pip install -U langchain-huggingface
        return HuggingFaceEmbeddings(model_name=Config.HF_EMBED_MODEL, model_kwargs={"device": "cpu"})
    if Config.EMBED_PROVIDER == "ollama":
        from langchain_ollama import OllamaEmbeddings
        return OllamaEmbeddings(model=Config.OLLAMA_EMBED_MODEL, base_url=Config.OLLAMA_BASE_URL)
    if Config.EMBED_PROVIDER == "gemini":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(model=Config.GEMINI_EMBED_MODEL, google_api_key=Config.GOOGLE_API_KEY)
    raise ValueError("Unsupported EMBED_PROVIDER")
