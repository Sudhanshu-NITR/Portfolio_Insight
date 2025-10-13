import os, shutil, subprocess
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma  # pip install -U langchain-chroma
from langchain_community.document_loaders import PyPDFLoader, UnstructuredURLLoader, TextLoader
from .llm import make_embedder
from config import Config
from utils.logging_utils import StepTimer

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 150

def load_pdf_resilient(path: str, meta: dict):
    docs = []
    try:
        docs = PyPDFLoader(path).load()
    except Exception:
        docs = []
    if not docs or all((not d.page_content or not d.page_content.strip()) for d in docs):
        if shutil.which("pdftotext"):
            txt_path = path + ".txt"
            try:
                subprocess.run(["pdftotext", "-layout", path, txt_path], check=True)
                tdocs = TextLoader(txt_path, encoding="utf-8").load()
                for d in tdocs:
                    d.metadata.update(meta)
                    d.metadata["note"] = "pdftotext_fallback"
                return tdocs
            except Exception:
                pass
        if shutil.which("ocrmypdf"):
            ocr_path = path + ".ocr.pdf"
            try:
                subprocess.run(["ocrmypdf", "--force-ocr", "--skip-text", path, ocr_path], check=True)
                ocr_docs = PyPDFLoader(ocr_path).load()
                for d in ocr_docs:
                    d.metadata.update(meta)
                    d.metadata["note"] = "ocrmypdf_fallback"
                if ocr_docs:
                    return ocr_docs
            except Exception:
                pass
    for d in docs:
        d.metadata.update(meta)
    return docs

def _abspath(p: str) -> str:
    return p if os.path.isabs(p) else os.path.join(os.getcwd(), p)

def load_docs(manifest: list[dict]):
    docs = []
    for i, item in enumerate(manifest):
        t = item.get("type"); meta = item.get("metadata", {}) or {}
        path = item.get("path"); url = item.get("url")
        if t == "pdf" and path:
            ap = _abspath(path)
            if not os.path.exists(ap):
                print(f"[INGEST] missing PDF: {ap}")
                continue
            loaded = load_pdf_resilient(ap, meta)
            print(f"[INGEST] pdf docs={len(loaded)} file={ap}")
            docs += loaded
        elif t == "url" and url:
            try:
                loader = UnstructuredURLLoader(urls=[url])
                loaded = loader.load()
                for d in loaded: d.metadata.update(meta)
                print(f"[INGEST] url docs={len(loaded)} url={url}")
                docs += loaded
            except Exception as e:
                print(f"[INGEST] url failed {url}: {e}")
        elif t == "text" and path:
            ap = _abspath(path)
            if not os.path.exists(ap):
                print(f"[INGEST] missing text: {ap}")
                continue
            loaded = TextLoader(ap, encoding="utf-8").load()
            for d in loaded: d.metadata.update(meta)
            print(f"[INGEST] text docs={len(loaded)} file={ap}")
            docs += loaded
        else:
            print(f"[INGEST] skipped item[{i}] type={t}")
    return docs

def ingest(manifest: list[dict]):
    tm = StepTimer("INGEST")
    tm.start(f"start; docs={len(manifest)}")
    docs = load_docs(manifest)
    tm.step(f"loaded_docs={len(docs)}")
    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    tm.step("chunking")
    chunks = splitter.split_documents(docs)
    print(f"[INGEST] total_docs={len(docs)} chunks={len(chunks)}")
    tm.step(f"chunked; chunks={len(chunks)}")
    if not chunks:
        return {"chunks_indexed": 0, "warning": "No text extracted. Provide .txt or install pdftotext/ocrmypdf in PATH."}
    tm.step("embedding init")
    embeddings = make_embedder()
    tm.step("embedding ready")
    tm.step("Chroma open/add")
    db = Chroma(
        collection_name="advisor_kg",
        embedding_function=embeddings,
        persist_directory=Config.VECTOR_DB_DIR  # auto-persistence when this is set
    )
    db.add_documents(chunks)
    return {"chunks_indexed": len(chunks)}
