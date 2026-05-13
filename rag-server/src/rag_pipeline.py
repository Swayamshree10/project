# rag-server/src/rag_pipeline.py — LangChain RAG pipeline using NVIDIA NIM + ChromaDB
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

COLLECTION = "mindtrail_engineering"
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

PROMPT_TEMPLATE = """You are Mind Trail, an expert AI tutor for engineering students.
You have deep knowledge across all engineering disciplines.
Use ONLY the context below to answer accurately and technically.
If the answer is not in the context, say "I don't have that topic in the curriculum yet. Try uploading that subject's textbook."
Always include relevant formulas, definitions, and examples.

Context:
{context}

Student Question: {question}

Answer (be precise, use proper engineering terminology):"""

def get_vectorstore():
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    return Chroma(
        collection_name=COLLECTION,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR,
    )

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_qa_chain():
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    llm = ChatOpenAI(
        model="qwen/qwen3.5-122b-a10b",
        api_key=os.getenv("NVIDIA_API_KEY"),
        base_url="https://integrate.api.nvidia.com/v1",
        temperature=0.2,
        max_tokens=1024,
    )

    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template=PROMPT_TEMPLATE,
    )

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, retriever
