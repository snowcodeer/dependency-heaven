# main.py
import json
from dotenv import load_dotenv
from openai import OpenAI
from aci import ACI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Initialize services
openai = OpenAI()
aci = ACI()
app = FastAPI(title="GitHub Repository Lister", version="1.0.0")

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_github_repositories():
    """Your exact working code wrapped in a function"""
    print("Getting function definition for GITHUB__LIST_REPOSITORIES")
    github_list_repos_function = aci.functions.get_definition("GITHUB__LIST_REPOSITORIES")

    print("Sending request to OpenAI")
    response = openai.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant with access to a variety of tools.",
            },
            {
                "role": "user",
                "content": "List snowcodeer's repositories for me",
            },
        ],
        tools=[github_list_repos_function],
        tool_choice="required",  # force the model to generate a tool call for demo purposes
    )
    tool_call = (
        response.choices[0].message.tool_calls[0]
        if response.choices[0].message.tool_calls
        else None
    )

    if tool_call:
        print("Handling function call")
        result = aci.handle_function_call(
            tool_call.function.name,
            json.loads(tool_call.function.arguments),
            linked_account_owner_id="snowcodeer",
        )
        print("Result:", result)
        return result
    else:
        raise Exception("No tool call generated")

@app.get("/")
async def root():
    return {"message": "GitHub Repository Lister API"}

@app.get("/repositories")
async def get_repositories():
    """List GitHub repositories"""
    try:
        print("=== Starting repository fetch ===")
        repositories = get_github_repositories()
        
        print("=== Raw result from ACI ===")
        print(json.dumps(repositories, indent=2))
        
        # Extract just the repository data from the response
        if isinstance(repositories, dict) and "data" in repositories:
            repo_data = repositories["data"]
            print(f"Found {len(repo_data)} repositories in data field")
            return {"repositories": repo_data}
        else:
            print("Returning repositories as-is")
            return {"repositories": repositories}
            
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print("Full traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)