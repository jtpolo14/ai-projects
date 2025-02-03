import os
import openai
import anthropic  # Add this import
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)

prompts = {
    "project_name": '''Get 1 proj name.EXPLAIN=NO.ex: name
    input: ''',
    "project_owner": '''Teams=[Fin, Ops, Tech] Extract 1 team from input, if not found suggest the most likely valid team. team must be in the list.EXPLAIN=NO.ex: Ops
    input: ''',
    "project_overview": "Write a concise project overview that explains what this project aims to achieve. input: ",
    "problem_statement": "Write a clear problem statement that this project aims to solve. input: ",
"prompt001": '''
PERFORM EACH COMMAND SEPARATELY AND RETURN THE OUTPUT AS A NewLine separated string.
project_name=Get 1 proj name.EXPLAIN=NO.ex: name
project_owner=Teams=[Fin, Ops, Tech] Extract 1 team from input, if not found suggest the most likely valid team. team must be in the list.EXPLAIN=NO.ex: Ops
project_overview=Write a concise project overview that explains what this project aims to achieve.
problem_statement=Write a clear problem statement that this project aims to solve
example_output:
tester
ops
this is a tester project
I dont know what to do

input: 
'''
}

def make_llm_call(prompt, model="claude-3-5-sonnet-20241022", temperature=0.7, max_tokens=150, use_fallback=False):
    """Makes a call to Claude, with optional OpenAI fallback."""
    
    try:
        # Try Claude first
        claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = claude.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.content[0].text, response

    except Exception as claude_error:
        print(f"Claude error: {claude_error}")
        
        if use_fallback:
            try:
                # Fallback to OpenAI if enabled
                response = openai.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                return response.choices[0].message['content'].strip(), response
            except Exception as openai_error:
                print(f"OpenAI error: {openai_error}")
                
        return None, None

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    print('data', data)
    target = data.get('target')
    user_input = data.get('user_input')

    responses = {}
    #for key, prompt in prompts.items():
    #    #response, _ = make_llm_call(prompts["project_name"].format(user_input))
    #    response = prompt + user_input
    #    responses[key] = response
    if target in prompts:
        filled_prompt =  prompts[target] + user_input
        response, _ = make_llm_call(filled_prompt)
        print('\nresponse', _)
        if target == 'prompt001':
            response = response.split('\n')
            responses["project_name"] = response[0]
            responses["project_owner"] = response[1]
            responses["project_overview"] = response[2]
            responses["problem_statement"] = response[3]

        else:
            responses[target] = response
    else:
        responses["error"] = "Invalid target"


    print('\nresponses', responses)
    return jsonify(responses)

# Debug/CLI mode
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        # Run Flask server mode
        app.run(debug=True, port=5000)
    else:
        # Run debug/CLI mode
        user_input = "car testing"  # Example input
        
        # Original debug code...
        llm_response, full_response = make_llm_call(prompts["project_name"].format(user_input))
        if llm_response:
            print("\nResponse LLM:")
            print(llm_response)
            print("\nResponse Full:")
            print(full_response)
        else:
            print("LLM call failed.")