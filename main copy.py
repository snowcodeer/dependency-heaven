import json
from dotenv import load_dotenv
from openai import OpenAI
from aci import ACI

load_dotenv()

openai = OpenAI()
aci = ACI()

def main() -> None:
    # Ask user for tool selection
    print("Select a tool to use:")
    print("1. Star a GitHub repository")
    print("2. Get file content from a GitHub repository")
    choice = input("Enter 1 or 2: ").strip()

    if choice == "1":
        function_name = "GITHUB__STAR_REPOSITORY"
        user_message = "Star the aipotheosis-labs/aci GitHub repository for me"
    elif choice == "2":
        function_name = "GITHUB__GET_FILE_CONTENT"
        user_message = "Get the content of README.md from the aipotheosis-labs/aci GitHub repository"
    else:
        print("Invalid input. Please enter 1 or 2.")
        return

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
            linked_account_owner_id='snowcodeer',  # Replace with your ID
        )
        print(result)


if __name__ == "__main__":
    main()
