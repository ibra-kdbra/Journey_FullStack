# Use this file to upload document chunk embeddings into Pinecone Index
# Only need to run once

from langchain.vectorstores import pinecone
from langchain.vectorstores.pinecone import Pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms.openai import OpenAI
from dotenv import load_dotenv

import pinecone
import os

load_dotenv()

llm = OpenAI()
embeddings = OpenAIEmbeddings()

def split_textfile_by_double_newline(filename):
    output = []
    with open(filename, 'r') as input_file:
        contents = input_file.read()
    parts = contents.split('\n\n')  # Split by double newline
    for part in parts:
      output.append(part)
    return output

documents = [
  "data/bio.txt"
]
chunks = []

for filename in documents:
  chunks.extend(split_textfile_by_double_newline(filename))

pinecone.init(
  api_key=os.environ.get('PINECONE_API_KEY'),
  environment='gcp-starter',
)

index_name = 'kchoi-io-chatbot'

# Upload chunked documents into Pinecone Index
# Only run this once to insert
Pinecone.from_texts(
  texts=chunks, 
  embedding=embeddings, 
  index_name=index_name
)