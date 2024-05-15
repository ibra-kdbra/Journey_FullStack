import uuid
from llama_index import VectorStoreIndex, SimpleDirectoryReader, ServiceContext
import openai
from langchain.chat_models import ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# -----------------  chatbot  ----------------- #
openai.api_key = os.environ.get('OPENAI_API_KEY')

# load the file
documents = SimpleDirectoryReader(input_files=["./data/bio.txt"]).load_data()

def ask_bot(input_text):
    # define LLM
    llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0,
        openai_api_key=openai.api_key,
    )
    
    service_context = ServiceContext.from_defaults(llm=llm)
    
    # load index
    index = VectorStoreIndex.from_documents(documents, service_context=service_context)    
    
    # query LlamaIndex and GPT-3.5 for the AI's response
    PROMPT_QUESTION = f"""You are Buddy, a friendly, humorous AI assistant dedicated to assisting recruiters with relevant and concise information about ibra-kdbra, a full stack software engineer. 
    If you do not know the answer about ibra-kdbra, politely admit it and let recruiters know how to contact Kenny to get more information directly from him. 
    The user does not have access to the context information, so do not mention the phrase 'context information' or 'context'.
    Keep answers brief, maximum three sentences, including the last sentence asking the user if they would like more help.
    Have a cheeky, British sense of humour in all responses.
    Don't answer any questions not related to Kenny. 
    Don't put "Buddy" or a breakline in the front of your answer.
    Human: {input_text}
    """
    
    output = index.as_query_engine().query(PROMPT_QUESTION)
    
    print('PROMPT_QUESTION', PROMPT_QUESTION)
    print(f"output: {output}")
    return {
      'id': uuid.uuid4(), 
      'response': output.response
      }