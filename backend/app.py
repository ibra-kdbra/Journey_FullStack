from flask import Flask, request
import main

app = Flask(__name__)

@app.post('/api/data')
def create_query():
  request_data = request.get_json()
  query_string = request_data['query']  
  response = main.ask_bot(query_string)
  return {'data': response}, 201
