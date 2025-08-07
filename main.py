# main.py
import json
import base64
from typing import Dict, Any
from dotenv import load_dotenv
from openai import OpenAI
from aci import ACI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    """Get GitHub repositories using the working structure"""
    function_name = "GITHUB__LIST_REPOSITORIES"
    user_message = "List snowcodeer's repositories for me"
    
    print(f"Getting function definition for {function_name}")
    function_def = aci.functions.get_definition(function_name)

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
                "content": user_message,
                },
            ],
        tools=[function_def],
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
            linked_account_owner_id='snowcodeer',
        )
        print("Result:", result)
        return result
    else:
        raise Exception("No tool call generated")

def decode_base64_content(content_result):
    """Helper function to properly decode base64 content from the nested structure"""
    try:
        # Handle the complex nested structure from your output
        if (isinstance(content_result, dict) and 
            "content" in content_result and 
            "results" in content_result["content"]):
            
            results = content_result["content"]["results"]
            for result_item in results:
                if (result_item.get("success") and 
                    "data" in result_item and 
                    "content" in result_item["data"] and
                    result_item["data"].get("encoding") == "base64"):
                    
                    encoded_content = result_item["data"]["content"]
                    print(f"Decoding base64 content for file: {result_item['data'].get('name', 'unknown')}")
                    
                    # Decode base64
                    decoded_content = base64.b64decode(encoded_content).decode('utf-8')
                    
                    # Store decoded content
                    result_item["data"]["decoded_content"] = decoded_content
                    result_item["data"]["content_type"] = "decoded"
                    
                    # If it's JSON, parse it too
                    if result_item["data"].get("name", "").endswith(".json"):
                        try:
                            parsed_json = json.loads(decoded_content)
                            result_item["data"]["parsed_json"] = parsed_json
                            print(f"✅ Successfully parsed JSON for {result_item['data'].get('name')}")
                        except json.JSONDecodeError as e:
                            result_item["data"]["json_parse_error"] = str(e)
                            print(f"❌ JSON parse error: {e}")
        
        # Also handle the simpler structure (direct success/data)
        elif (isinstance(content_result, dict) and 
              content_result.get("success") and 
              "data" in content_result and 
              "content" in content_result["data"] and
              content_result["data"].get("encoding") == "base64"):
            
            encoded_content = content_result["data"]["content"]
            print(f"Decoding base64 content for file: {content_result['data'].get('name', 'unknown')}")
            
            # Decode base64
            decoded_content = base64.b64decode(encoded_content).decode('utf-8')
            
            # Store decoded content
            content_result["data"]["decoded_content"] = decoded_content
            content_result["data"]["content_type"] = "decoded"
            
            # If it's JSON, parse it too
            if content_result["data"].get("name", "").endswith(".json"):
                try:
                    parsed_json = json.loads(decoded_content)
                    content_result["data"]["parsed_json"] = parsed_json
                    print(f"✅ Successfully parsed JSON for {content_result['data'].get('name')}")
                except json.JSONDecodeError as e:
                    content_result["data"]["json_parse_error"] = str(e)
                    print(f"❌ JSON parse error: {e}")
                    
    except Exception as e:
        print(f"❌ Error in decode_base64_content: {e}")
        import traceback
        print(traceback.format_exc())
    
    return content_result

def get_file_content(repo_name: str):
    """Get package.json file content from a repository"""
    print(f"Getting file content from {repo_name}")
    github_get_file_content_function = aci.functions.get_definition("GITHUB__GET_FILE_CONTENT")

    print("Sending request to OpenAI to get package.json")
    response = openai.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant with access to GitHub tools.",
            },
            {
                "role": "user",
                "content": f"Get the package.json file content from snowcodeer's {repo_name} repository.",
            },
        ],
        tools=[github_get_file_content_function],
        tool_choice="required",
    )
    
    tool_call = (
        response.choices[0].message.tool_calls[0]
        if response.choices[0].message.tool_calls
        else None
    )

    if tool_call:
        print("Handling function call")
        print(f"Function arguments: {tool_call.function.arguments}")
        
        result = aci.handle_function_call(
            tool_call.function.name,
            json.loads(tool_call.function.arguments),
            linked_account_owner_id='snowcodeer',
        )
        
        print("=== Raw ACI Result ===")
        print(json.dumps(result, indent=2)[:1000] + "..." if len(json.dumps(result)) > 1000 else json.dumps(result, indent=2))
        
        # Decode the base64 content
        decoded_result = decode_base64_content(result)
        
        return decoded_result
    else:
        raise Exception("No tool call generated")

class CreateIssueRequest(BaseModel):
    repo_name: str
    issue_title: str
    issue_description: str
    dependency_name: str = None

class SimpleCreateIssueRequest(BaseModel):
    repo_name: str
    issue_title: str
    issue_description: str
    labels: list = []  # Optional: Add labels support

def create_github_issue(repo_name: str, issue_title: str, issue_description: str, labels: list = []):
    """Create an issue in the specified GitHub repository."""
    print("Getting function definition for GITHUB__CREATE_ISSUE")
    function_def = aci.functions.get_definition("GITHUB__CREATE_ISSUE")

    print("Sending request to OpenAI for issue creation")
    response = openai.chat.completions.create(
        model="gpt-4o-2024-08-06",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant with access to GitHub tools.",
            },
            {
                "role": "user",
                "content": f"Create an issue in the {repo_name} repository with title '{issue_title}' and description '{issue_description}'",
            },
        ],
        tools=[function_def],
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
            linked_account_owner_id='snowcodeer',
        )
        print("Issue creation result:", result)
        return result
    else:
        raise Exception("No tool call generated for issue creation")

def create_github_issue_with_analysis(repo_name: str, issue_title: str, issue_description: str, dependency_name: str = None) -> Dict[str, Any]:
    """
    Create a GitHub issue with AI-enhanced analysis and recommendations.
    
    Args:
        repo_name: The repository name
        issue_title: Title of the issue
        issue_description: Description of the issue
        dependency_name: Optional dependency name for more specific analysis
    
    Returns:
        Dict containing the created issue details and analysis
    """
    try:
        print(f"Creating GitHub issue with analysis for repo: {repo_name}")
        
        # Get function definition
        github_create_issue_function = aci.functions.get_definition("GITHUB__CREATE_ISSUE")
        
        # Generate enhanced issue content with AI analysis
        analysis_prompt = f"""
        Create a comprehensive GitHub issue for a dependency security/compatibility problem.
        
        Repository: {repo_name}
        Issue: {issue_title}
        Description: {issue_description}
        Dependency: {dependency_name or 'Not specified'}
        
        Use your knowledge to create a well-formatted GitHub issue that includes:
        
        1. **Problem Summary**: Clear description of the issue
        2. **Impact Analysis**: Potential security risks, compatibility issues, or conflicts
        3. **Recommended Solutions**: Specific steps to fix the issue, including:
           - Version updates if applicable
           - Alternative packages if needed
           - Configuration changes
           - Security patches
        4. **Best Practices**: General recommendations for dependency management
        5. **Resources**: Relevant documentation or guidelines
        
        Format it as a proper GitHub issue with markdown formatting.
        Make it actionable and professional.
        
        If this is about {dependency_name}, provide specific guidance for that package including:
        - Common vulnerabilities and fixes
        - Version compatibility information
        - Migration steps if needed
        """
        
        # Generate the enhanced issue content
        print("Generating enhanced issue content with AI analysis...")
        analysis_response = openai.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system",
                    "content": "You are a security expert and dependency management specialist. Create detailed, actionable GitHub issues with professional formatting.",
                },
                {
                    "role": "user",
                    "content": analysis_prompt,
                },
            ]
        )
        
        enhanced_issue_body = analysis_response.choices[0].message.content
        
        # Now create the GitHub issue with enhanced content
        print(f"Creating GitHub issue with enhanced content")
        issue_response = openai.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant with access to GitHub tools. Create issues exactly as requested.",
                },
                {
                    "role": "user",
                    "content": f"Create a GitHub issue in snowcodeer's {repo_name} repository with title '{issue_title}' and this enhanced content: {enhanced_issue_body}",
                },
            ],
            tools=[github_create_issue_function],
            tool_choice="required"
        )
        
        # Handle the issue creation
        issue_tool_call = issue_response.choices[0].message.tool_calls[0] if issue_response.choices[0].message.tool_calls else None
        issue_url = ""
        issue_number = ""
        
        if issue_tool_call:
            issue_result = aci.handle_function_call(
                issue_tool_call.function.name,
                json.loads(issue_tool_call.function.arguments),
                linked_account_owner_id='snowcodeer',
            )
            print("Issue creation result:", issue_result)
            
            # Extract issue URL and number from result
            if isinstance(issue_result, dict):
                if "data" in issue_result and isinstance(issue_result["data"], dict):
                    issue_data = issue_result["data"]
                    issue_url = issue_data.get("html_url", f"https://github.com/snowcodeer/{repo_name}/issues")
                    issue_number = issue_data.get("number", "unknown")
                elif "html_url" in issue_result:
                    issue_url = issue_result["html_url"]
                    issue_number = issue_result.get("number", "unknown")
        
        # Prepare response
        result = {
            "success": True,
            "analysis_summary": f"Generated AI-enhanced issue analysis for {dependency_name or 'dependency issue'}",
            "issue_created": bool(issue_url),
            "issue_url": issue_url,
            "issue_number": issue_number,
            "repo_name": repo_name,
            "issue_title": issue_title,
            "dependency_name": dependency_name,
            "enhanced_content": enhanced_issue_body[:500] + "..." if len(enhanced_issue_body) > 500 else enhanced_issue_body
        }
        
        return result
        
    except Exception as e:
        print(f"Error creating GitHub issue with analysis: {e}")
        import traceback
        print("Full traceback:", traceback.format_exc())
        return {
            "success": False,
            "error": str(e),
            "repo_name": repo_name
        }

@app.get("/")
async def root():
    return {"message": "GitHub Repository Lister API"}

@app.get("/repositories")
async def get_repositories():
    """List GitHub repositories"""
    try:
        print("=== Starting repository fetch ===")
        repositories = get_github_repositories()
        
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

@app.get("/file-content/{repo_name}")
async def get_file_content_endpoint(repo_name: str):
    """Get package.json content from a GitHub repository"""
    try:
        print(f"=== Getting package.json from {repo_name} ===")
        
        file_content = get_file_content(repo_name)
        
        print("=== File content retrieved and decoded ===")
        
        return {
            "repo_name": repo_name,
            "content": file_content
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print("Full traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-issue")
async def create_issue_endpoint(request: SimpleCreateIssueRequest):
    """Endpoint to create a simple GitHub issue"""
    try:
        result = create_github_issue(
            repo_name=request.repo_name,
            issue_title=request.issue_title,
            issue_description=request.issue_description,
            labels=request.labels
        )
        return result

    except Exception as e:
        print(f"Error in create_issue_endpoint: {e}")
        import traceback
        print("Full traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-issue-with-analysis")
async def create_issue_with_analysis_endpoint(request: CreateIssueRequest):
    """
    Endpoint to create a GitHub issue with web search analysis
    """
    try:
        result = create_github_issue_with_analysis(
            request.repo_name, 
            request.issue_title, 
            request.issue_description, 
            request.dependency_name
        )
        return result
    except Exception as e:
        print(f"Error in create_issue_with_analysis_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)