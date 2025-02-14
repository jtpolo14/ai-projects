import os
import openai
import anthropic  # Add this import
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import json  # Add this import at the top

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
''',
"prompt002": '''
PERFORM EACH COMMAND SEPARATELY AND RETURN THE OUTPUT AS A NewLine separated string.
project_name=Get 1 proj name.EXPLAIN=NO.ex: name
project_owner=Teams=[Fin, Ops, Tech] Extract 1 team from input, If the input is not clear, default to TBD. team must be in the list.EXPLAIN=NO.ex: Ops
project_overview=Write a concise project overview that explains what this project aims to achieve. If the input is not clear or more context is needed, default to TBD.
problem_statement=Write a clear problem statement that this project aims to solve. If the input is not clear or more context is needed, default to TBD.
follow_up=Write a follow up question that is clear and concise. Parse the above fields (start with project_name) to determine if more information is needed(any field that is TBD) and base the follow up question on that. One follow up question per prompt. If all fields are filled, default to: Please review all data and press submit.
example_output:
tester
ops
this is a tester project
I dont know what to do
Please review all data and press submit

input: 
''',
"prompt003": '''
PERFORM EACH COMMAND SEPARATELY AND RETURN THE OUTPUT.
project_name=Get 1 proj name.EXPLAIN=NO.ex: name
project_owner=Teams=[Fin, Ops, Tech] Extract 1 team from input, If the input is not clear, default to TBD. team must be in the list.EXPLAIN=NO.ex: Ops
project_overview=Write a concise project overview that explains what this project aims to achieve. If the input is not clear or more context is needed, default to TBD.
problem_statement=Write a clear problem statement that this project aims to solve. If the input is not clear or more context is needed, default to TBD.
target_date=Write a target date for the project. If the input is not clear or more context is needed, default to TBD. EXPLAIN=NO.ex: mm/dd/yyyy
impact_financial=Write a financial impact for the project. If the input is not clear or more context is needed, default to TBD.
impact_customer=Write a customer impact for the project. If the input is not clear or more context is needed, default to TBD.
impact_operational=Write an operational impact for the project. If the input is not clear or more context is needed, default to TBD.
follow_up=Write a follow up response that is clear and concise. Parse the above fields in order, to determine if more information is needed(any field that is TBD) and base the follow up repsonse on that. If all fields are filled, default to: Please review all data carefully and proceed.
example_output (response should be minified json without any additional text):
{"project_name":"tester","project_owner":"ops","project_overview":"this is a tester project","problem_statement":"I dont know what to do","target_date":"12/31/2024","impact_financial":"Estimated cost savings of $100k annually","impact_customer":"Improved customer satisfaction through faster response times","impact_operational":"Reduced manual effort by 20 hours per week","follow_up":"Please review all data and press submit"}
input: 
'''
}

def make_llm_call(prompt, model="claude-3-5-sonnet-20241022", temperature=0.7, max_tokens=500, use_fallback=False):
    """Makes a call to Claude, with optional OpenAI fallback."""
    
    try:
        # Try Claude first
        claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = claude.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system="You are a seasoned technical project manager and data engineer at a Fortune 500 company. You are responsible for asking any follow up questions required to ensure all project requests have clear and concise requirements, impact, and ownership.",
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
    print('Request data:', json.dumps(data, indent=2))  # Pretty print request
    
    user_input = data.get('user_input')
    history = data.get('history')
    target = data.get('target')

    print('Target data:', json.dumps(target, indent=2))  # Pretty print request
    
    responses = {}
    if target in prompts:
        filled_prompt =  prompts[target] + user_input + '\n\n' + 'Conversation History:\n' + '\n'.join(history)
        print('\nfilled_prompt', filled_prompt)
        response, _ = make_llm_call(filled_prompt)
        print('\nresponse', _)
        if target == 'prompt001':
            response = response.split('\n')
            responses["project_name"] = response[0]
            responses["project_owner"] = response[1]
            responses["project_overview"] = response[2]
            responses["problem_statement"] = response[3]
        
        elif target == 'prompt002':
            response = response.split('\n')
            responses["project_name"] = response[0]
            responses["project_owner"] = response[1]
            responses["project_overview"] = response[2]
            responses["problem_statement"] = response[3]
            responses["follow_up"] = response[4]

        elif target == 'prompt003':
            responses = response  # Simply pass through the response

        else:
            responses[target] = response
    else:
        responses["error"] = "Invalid target"

    print('\nResponse data:', json.dumps(responses, indent=2))  # Pretty print response
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