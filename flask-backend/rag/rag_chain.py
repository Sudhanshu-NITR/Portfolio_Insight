from langchain.schema.runnable import RunnablePassthrough
from langchain.prompts import ChatPromptTemplate
from .llm import make_chat_llm
from .retriever import get_retriever

SYSTEM = """You are a professional India-first portfolio assistant.
Use retrieved context for concepts; call tools for current data when needed.
Avoid personalized tax/legal advice; provide risks and benchmark context."""

PROMPT = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "Question: {question}\n\nContext:\n{context}\n\nAnswer clearly and concisely."),
])

def build_rag_chain():
    retriever = get_retriever()
    llm = make_chat_llm()
    chain = (
        {
            "context": retriever | (lambda docs: "\n\n".join([d.page_content[:1200] for d in docs])),
            "question": RunnablePassthrough()
        }
        | PROMPT
        | llm
    )
    return chain
