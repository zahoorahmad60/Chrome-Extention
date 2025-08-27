from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate

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
   # print(snippet.text)
    transcript.append(snippet.text)

# indexable
last_snippet = fetched_transcript[-1]

# provides a length
snippet_count = len(fetched_transcript)
transcript

updated_transcript = " ".join(transcript)
updated_transcript

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.create_documents([updated_transcript])