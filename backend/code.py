from youtube_transcript_api import YouTubeTranscriptApi
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser

embedding_model = OllamaEmbeddings(model="nomic-embed-text:latest")
llm = ChatOllama(model="deepseek-r1:1.5b")

video_id = "W-7h6XHXecA" # only the ID, not full URL
from youtube_transcript_api import YouTubeTranscriptApi

ytt_api = YouTubeTranscriptApi()
ytt_api.fetch(video_id)

ytt_api = YouTubeTranscriptApi()
fetched_transcript = ytt_api.fetch(video_id)
transcript = []
# is iterable
for snippet in fetched_transcript:
    transcript.append(snippet.text)

# indexable
last_snippet = fetched_transcript[-1]

snippet_count = len(fetched_transcript)
transcript

updated_transcript = " ".join(transcript)
updated_transcript

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.create_documents([updated_transcript])

#embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vector_store = FAISS.from_documents(chunks, embedding_model)

retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4})

prompt = PromptTemplate(
    template="""
      You are a helpful assistant.
      Answer ONLY from the provided transcript context.
      If the context is insufficient, just say you don't know.

      {context}
      Question: {question}
    """,
    input_variables = ['context', 'question']
)

def format_docs(retrieved_docs):
  context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
  return context_text

parallel_chain = RunnableParallel({
    'context': retriever | RunnableLambda(format_docs),
    'question': RunnablePassthrough()
})

parser = StrOutputParser()

main_chain = parallel_chain | prompt | llm | parser

main_chain.invoke('Can you summarize the video')

#this is the whole code in one coding file.
#i will change the code and split it into 