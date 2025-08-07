
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

def list_repositories():
    """List GitHub repositories using ACI and OpenAI"""
    try:
        print("Getting function definition for GITHUB__LIST_REPOSITORIES")
        github_list_repos_function = aci.functions.get_definition("GITHUB__LIST_REPOSITORIES")
        
        print("Sending request to OpenAI")
        response = openai.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that can list GitHub repositories.",
                },
                {
                    "role": "user",
                    "content": "List my repositories",
                },
            ],
            tools=[github_list_repos_function],
            tool_choice="required",
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
                linked_account_owner_id="<LINKED_ACCOUNT_OWNER_ID>",
            )
            return result
        else:
            raise Exception("No tool call generated")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "GitHub Repository Lister API"}

@app.get("/repositories")
async def get_repositories():
    """List GitHub repositories"""
    repositories = list_repositories()
    return {"repositories": repositories}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
