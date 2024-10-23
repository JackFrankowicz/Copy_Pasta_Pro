import logging
import os
from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse, PlainTextResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI  # Assuming this is the correct import for OpenAI

#Initialize OpenAI client 
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI()

# Get the base directory (directory where this script is located)
base_directory = os.path.dirname(os.path.abspath(__file__))
logger.info(f"Base directory set to: {base_directory}")



@app.post("/api/o1")
async def o1_stream(request: Request):
    """
    Handles POST requests to the "/api/o1" endpoint.
    Expects JSON input with 'input' and 'model' fields.
    """
    try:
        logger.info("Received request at /api/o1")

        # Read JSON data from the request body
        data = await request.json()
        input_text = data.get('input', '')
        model = data.get('model', 'gpt-4o-mini')  # Updated default model if needed
        logger.info(f"Input text: {input_text}")
        logger.info(f"Model: {model}")

        # Create a message structure for OpenAI API
        messages = [{"role": "user", "content": input_text}]

        # Use OpenAI ChatCompletion API
        response = client.chat.completions.create(
            model=model,  # Use the selected model
            messages=messages
        )
        logger.info(f"Full API response: {response}")

        # Extract content and token usage
        content = response.choices[0].message.content
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens
        total_tokens = response.usage.total_tokens
        logger.info(f"Prompt tokens: {prompt_tokens}")
        logger.info(f"Completion tokens: {completion_tokens}")
        logger.info(f"Total tokens used: {total_tokens}")

        # Return the content and token counts as JSON
        return JSONResponse(content={
            "content": content,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens
        })

    except Exception as error:
        logger.error(f"Error in o1_stream: {error}")
        return PlainTextResponse(content=f"Unexpected error: {str(error)}", status_code=500)

@app.post("/save_code")
async def save_code(request: Request):
    """
    Handles POST requests to save code snippets to files.
    Supports creating directories if they do not exist.
    Expects JSON input with 'code' and 'file_path' fields.
    """
    try:
        data = await request.json()
        code_content = data.get('code')
        file_path = data.get('file_path')

        if not code_content or not file_path:
            logger.warning("Missing 'code' or 'file_path' in the request.")
            return PlainTextResponse(content="Missing 'code' or 'file_path' in the request.", status_code=400)

        full_path = os.path.join(base_directory, file_path)

        # Ensure the directory exists, and create it if not
        directory = os.path.dirname(full_path)
        if not os.path.exists(directory):
            os.makedirs(directory)  # This creates the directory
            logger.info(f"Created directory: {directory}")

        # Write the code content to the file
        with open(full_path, 'w') as f:
            f.write(code_content)

        logger.info(f"Code saved to {full_path}")
        return {"status": "success", "message": "Code saved successfully."}

    except Exception as error:
        logger.error(f"Error saving code: {error}")
        return PlainTextResponse(content=f"Failed to save code: {str(error)}", status_code=500)
    

@app.get("/get_code")
async def get_code(file_path: str = Query(..., description="Path of the file to read")):
    """
    Serve the content of a requested file to the client.
    Allows any file within the base directory, with checks to ensure valid paths.
    """
    try:
        full_path = os.path.join(base_directory, file_path)
        # Ensure the final path is within the base directory and prevent directory traversal attacks
        normalized_path = os.path.normpath(full_path)
        if not normalized_path.startswith(base_directory):
            logger.warning(f"Attempt to access file outside base directory: {normalized_path}")
            return PlainTextResponse(content="Invalid file path", status_code=400)

        # Read the file content
        with open(normalized_path, 'r') as f:
            content = f.read()
        return PlainTextResponse(content=content)

    except Exception as e:
        logger.error(f"Error reading file {file_path}: {str(e)}")
        return PlainTextResponse(content=f"Error reading file: {str(e)}", status_code=500)

    
@app.get("/")
async def read_root():
    index_path = os.path.join(base_directory, "index.html")
    try:
        with open(index_path, "r") as f:
            content = f.read()
        logger.info("Serving index.html")
        return HTMLResponse(content=content)
    except Exception as e:
        logger.error(f"Error reading index.html: {str(e)}")
        return PlainTextResponse(content="Error reading index.html", status_code=500)

# Mount static files (ensuring the path is correct)
static_directory = os.path.join(base_directory, "static")
app.mount("/static", StaticFiles(directory=static_directory), name="static")
