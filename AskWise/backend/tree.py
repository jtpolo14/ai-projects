app = {
    "prompt004": '''You are a project consultant. Your performance will be graded on: 1) You should parse a decision tree and use it as the guide to walk a user through a project request form 2) Write a follow up response that is clear and concise. Parse the fields following the id and next logic, to determine if more information is needed(any field that is TBD) and base the follow up repsonse on that. 3) If a field is not needed then mark it as NA. 4) If all fields are filled, default to: Please review all data carefully and proceed. 5) If the input for a field is not clear or more context is needed, default to TBD. 6) For follow ups create user friendly field names instead of id.
example_output (response should be minified json without any additional text): {"project_name":"tester","project_owner":"ops","project_overview":"this is a tester project","problem_statement":"I dont know what to do","target_date":"12/31/2025","impact_financial":"Estimated cost savings of $100k annually","impact_customer":"Improved customer satisfaction through faster response times","impact_operational":"Reduced manual effort by 20 hours per week",...{placholder for future fields}...,"follow_up":"Please review all data and press submit"}
    ''',
    "decision_tree": [
        {
            "question": "What is the name of your project?",
            "id": "project_name",
            "type": "text",
            "required": True,
            "rules": "Get 1 proj name.EXPLAIN=NO.ex: name",
            "next": ["project_owner"]
        },
        {
            "question": "Which team will own this project?",
            "id": "project_owner",
            "type": "select",
            "options": [
                {"label": "Finance", "value": "Fin"},
                {"label": "Operations", "value": "Ops"},
                {"label": "Technology", "value": "Tech"}
            ],
            "required": True,
            "rules": "Teams=[Fin, Ops, Tech] Extract 1 team from input, team must be in the list.EXPLAIN=NO.ex: Ops",
            "next": [
        { "condition": "IF", "value": "Fin", "target": "compliance_sox" },
        "project_overview"
      ]
        },
        {
            "question": "Please provide a brief overview of your project.",
            "id": "project_overview",
            "type": "textarea",
            "required": True,
            "placeholder": "Describe what this project aims to achieve",
            "rules": "Write a concise project overview that explains what this project aims to achieve. ",
            "next": ["problem_statement"]
        },
        {
            "question": "What problem does this project solve?",
            "id": "problem_statement",
            "type": "textarea",
            "required": True,
            "placeholder": "Describe the current challenge or issue",
            "rules": "Write a clear problem statement that this project aims to solve. "
        },
        {
            "question": "When do you expect this project to be completed?",
            "id": "target_date",
            "type": "date",
            "required": False,
            "rules": "Write a target date for the project.  EXPLAIN=NO.ex: mm/dd/yyyy"
        },
        {
            "question": "What is the expected financial impact?",
            "id": "impact_financial",
            "type": "textarea",
            "required": False,
            "placeholder": "Describe cost savings, revenue increase, etc.",
            "rules": "Write a financial impact for the project. "
        },
        {
            "question": "How will this affect our customers?",
            "id": "impact_customer",
            "type": "textarea",
            "required": False,
            "placeholder": "Describe customer experience improvements",
            "rules": "Write a customer impact for the project. "
        },
        {
            "question": "What operational changes will this bring?",
            "id": "impact_operational",
            "type": "textarea",
            "required": False,
            "placeholder": "Describe changes to processes or workflows",
            "rules": "Write an operational impact for the project. "
        },
        {
            "question": "What sox risks should be considered?",
            "id": "compliance_sox",
            "type": "textarea",
            "required": False,
            "placeholder": "Describe the sox risks",
            "rules": "Write an sox risk assessment for the project. "
        }
    ]
}

########################################################

# HELPER FUNCTIONS

import json

def get_minified_tree():
    """Returns the tree structure as a minified JSON string."""
    return json.dumps(tree, separators=(',', ':'))

if __name__ == "__main__":
    # Print minified JSON when run directly
    print(get_minified_tree()) 