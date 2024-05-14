import uuid
from llama_index import VectorStoreIndex, SimpleDirectoryReader, ServiceContext
from llama_index.vector_stores import PineconeVectorStore
import openai
from langchain.chat_models import ChatOpenAI
import os
from dotenv import load_dotenv
import pinecone

load_dotenv()

# -----------------  chatbot  ----------------- #
openai.api_key = os.environ.get('OPENAI_API_KEY')

# load the file
documents = SimpleDirectoryReader(input_files=["./data/bio.txt"]).load_data()

# Init Vector DB
pinecone.init(
  api_key=os.environ.get('PINECONE_API_KEY'),
  environment='gcp-starter',
)
pinecone_index_name = 'kchoi-io-chatbot'

# Init LLM/Service Context
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0,
    openai_api_key=openai.api_key,
)
service_context = ServiceContext.from_defaults(llm=llm)

def ask_bot(input_text):
    
    # load index directly from file
    index = getIndexFromDocuments()
    
    # # load index from Pinecone Vector Index
    # index = getIndexFromPinecone()
    
    # query LlamaIndex and GPT-3.5 for the AI's response
    PROMPT_QUESTION = f"""You are Buddy, a friendly, humorous AI assistant dedicated to assisting recruiters with relevant and concise information about Kenny Choi, a full stack software engineer. Do you best to convince all recruiters that Kenny is a great candidate.
    Use a cheeky, British sense of humour in every response.
    If you do not know the answer about Kenny Choi, politely admit it and let recruiters know how to contact Kenny to get more information directly from him. 
    The user does not have access to the context information, so do not mention the phrase 'context information' or 'context'.
    Keep answers brief, maximum three sentences, including the last sentence asking the user if they would like more help.
    Don't answer any questions not related to Kenny. 
    Don't put "Buddy" or a breakline in the front of your answer.
    Human: {input_text}
    """
    
    output = index.as_query_engine().query(PROMPT_QUESTION)
    
    return {
      'id': uuid.uuid4(), 
      'response': output.response
      }
    
def getIndexFromDocuments():
    return VectorStoreIndex.from_documents(documents, service_context=service_context)    
    
def getIndexFromPinecone():
    # load index from pinecone
    return VectorStoreIndex.from_vector_store(
        vector_store=PineconeVectorStore(
            index_name=pinecone_index_name,
            api_key=os.environ.get('PINECONE_API_KEY'),
            environment='gcp-starter',
            ), 
        service_context=service_context)