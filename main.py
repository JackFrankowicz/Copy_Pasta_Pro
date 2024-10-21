# /home/jack/aaaDEV/main.py

import logging
import os
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI

# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
        model = data.get('model', 'o1-preview')
        logger.info(f"Input text: {input_text}")
        logger.info(f"Model: {model}")

        # Create a message structure for OpenAI API
        messages = [{"role": "user", "content": input_text}]

        # Send the request to the OpenAI API to generate a completion
        response = client.chat.completions.create(
            model=model,  # Use the selected model
            messages=messages
        )
        logger.info(f"Full API response: {response}")

        # Extract and return the content as is
        content = response.choices[0].message.content

        # Return the content as plain text
        return PlainTextResponse(content=content)

    except Exception as error:
        logger.error(f"Error in o1_stream: {error}")
        return PlainTextResponse(content=f"Unexpected error: {str(error)}", status_code=500)

@app.post("/save_code")
async def save_code(request: Request):
    """
    Handles POST requests to save code snippets to files.
    Expects JSON input with 'code' and 'file_path' fields.
    """
    try:
        data = await request.json()
        code_content = data.get('code')
        file_path = data.get('file_path')

        base_directory = '/home/jack/aaaDEV/'
        full_path = os.path.join(base_directory, file_path)

        # Write the code content to the file
        with open(full_path, 'w') as f:
            f.write(code_content)

        logger.info(f"Code saved to {full_path}")
        return {"status": "success", "message": "Code saved successfully."}

    except Exception as error:
        logger.error(f"Error saving code: {error}")
        return PlainTextResponse(content=f"Failed to save code: {str(error)}", status_code=500)

@app.get("/")
async def read_root():
    with open("index.html", "r") as f:
        content = f.read()
    logger.info("Serving index.html")
    return HTMLResponse(content=content)

# Mount static files (if any are needed without styling)
app.mount("/static", StaticFiles(directory="static"), name="static")
