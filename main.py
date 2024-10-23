import logging
import os
import json
from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse, PlainTextResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI  # Assuming this is the correct import for OpenAI

# Initialize OpenAI client 
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI()

# Program Base Directory (Where app is located)
program_base_directory = os.path.dirname(os.path.abspath(__file__))

# Path to config.json in the program base directory
config_file_path = os.path.join(program_base_directory, "config", "config.json")

# Load File Base Directory from config.json
with open(config_file_path, "r") as config_file:
    config = json.load(config_file)
    file_base_directory = config["baseDirectory"]

# Check if file base directory is relative and resolve it
if not os.path.isabs(file_base_directory):
    file_base_directory = os.path.join(program_base_directory, file_base_directory)

logger.info(f"Program base directory: {program_base_directory}")
logger.info(f"File base directory: {file_base_directory}")

# Serve the config directory for program files
config_directory = os.path.join(program_base_directory, "config")
if os.path.exists(config_directory):
    app.mount("/config", StaticFiles(directory=config_directory), name="config")
else:
    logger.warning(f"Config directory {config_directory} does not exist")

# POST: /api/o1 - Handles OpenAI model requests
@app.post("/api/o1")
async def o1_stream(request: Request):
    try:
        logger.info("Received request at /api/o1")
        data = await request.json()
        input_text = data.get('input', '')
        model = data.get('model', 'gpt-4o-mini')
        logger.info(f"Input text: {input_text}")
        logger.info(f"Model: {model}")

        messages = [{"role": "user", "content": input_text}]

        # Use OpenAI ChatCompletion API
        response = client.chat.completions.create(model=model, messages=messages)
        logger.info(f"Full API response: {response}")

        content = response.choices[0].message.content
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens
        total_tokens = response.usage.total_tokens

        return JSONResponse(content={
            "content": content,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens
        })

    except Exception as error:
        logger.error(f"Error in o1_stream: {error}")
        return PlainTextResponse(content=f"Unexpected error: {str(error)}", status_code=500)

# POST: /save_code - Save files to the file base directory
@app.post("/save_code")
async def save_code(request: Request):
    try:
        data = await request.json()
        code_content = data.get('code')
        file_path = data.get('file_path')

        if not code_content or not file_path:
            logger.warning("Missing 'code' or 'file_path' in the request.")
            return PlainTextResponse(content="Missing 'code' or 'file_path' in the request.", status_code=400)

        # Build the full path using the file base directory
        full_path = os.path.join(file_base_directory, file_path)

        # Ensure the directory for the file exists, and create it if not
        directory = os.path.dirname(full_path)
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Created directory: {directory}")

        # Write the code content to the file (overwrite if it exists)
        with open(full_path, 'w') as f:
            f.write(code_content)

        logger.info(f"Code saved to {full_path}")
        return JSONResponse(content={"status": "success", "message": "Code saved successfully."})

    except Exception as error:
        logger.error(f"Error saving code: {error}")
        return PlainTextResponse(content=f"Failed to save code: {str(error)}", status_code=500)

# GET: /get_code - Retrieve a file's content from the file base directory
@app.get("/get_code")
async def get_code(file_path: str = Query(..., description="Path of the file to read")):
    try:
        full_path = os.path.join(file_base_directory, file_path)
        normalized_path = os.path.normpath(full_path)

        # Read the file content
        with open(normalized_path, 'r') as f:
            content = f.read()
        return PlainTextResponse(content=content)

    except Exception as e:
        logger.error(f"Error reading file {file_path}: {str(e)}")
        return PlainTextResponse(content=f"Error reading file: {str(e)}", status_code=500)

# GET: / - Serve index.html from the program base directory
@app.get("/")
async def read_root():
    index_path = os.path.join(program_base_directory, "index.html")
    try:
        with open(index_path, "r") as f:
            content = f.read()
        logger.info(f"Serving index.html from {index_path}")
        return HTMLResponse(content=content)
    except Exception as e:
        logger.error(f"Error reading index.html: {str(e)}")
        return PlainTextResponse(content="Error reading index.html", status_code=500)

# Serve static files from the /static folder in the program base directory
static_directory = os.path.join(program_base_directory, "static")
if os.path.exists(static_directory):
    app.mount("/static", StaticFiles(directory=static_directory), name="static")
else:
    logger.warning(f"Static directory {static_directory} does not exist.")
