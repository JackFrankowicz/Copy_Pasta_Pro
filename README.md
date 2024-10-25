# Copy Pasta Pro

Copy Pasta Pro is a web application designed to streamline the interaction with OpenAI's language models. It provides a user-friendly interface to input text, send requests to various OpenAI models, and manage code snippets efficiently. The application is built using FastAPI for the backend and modern JavaScript for the frontend.

## Features

- **Multi-Input Areas**: Add multiple input areas dynamically to send complex queries.
- **Drag-and-Drop Rearrangement**: Reorder input areas easily with a simple drag-and-drop interface powered by SortableJS.
- **Predefined File Insertion**: Insert content from predefined files into input areas to provide context.
- **API Interaction**: Seamlessly interact with OpenAI's API to get responses from different models.
- **Response Formatting**: Displays responses with proper Markdown formatting and syntax highlighting using Prism.js.
- **Code Management**: Save and load code snippets, with options to copy and save code blocks directly from the interface.
- **Settings Management**: Customize base directories and manage predefined files via a dedicated settings page.

## Table of Contents

- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Interacting with the Interface](#interacting-with-the-interface)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Demo

![Copy Pasta Pro Interface](https://your-demo-image-url.com/interface.png)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- **Python 3.7 or higher**
- **Node.js and npm** (for frontend dependencies if needed)
- **OpenAI API Key**: You must have an OpenAI API key to interact with the OpenAI models.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/copy-pasta-pro.git
   cd copy-pasta-pro
   ```

2. **Create a Virtual Environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install Python Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Configuration

### Backend (FastAPI)

- **`config/config.json`**: Contains the base directory and predefined files for context insertion.
  
  ```json
  {
    "baseDirectory": "/path/to/your/base/directory",
    "predefinedFiles": [
      "/path/to/file1.txt",
      "/path/to/file2.txt"
    ]
  }
  ```

- **Environment Variables**: Ensure that your `OPENAI_API_KEY` is set in the environment or in a `.env` file.

## Usage

### Running the Application

Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload
```

- The application will be accessible at `http://localhost:8000`.

### Interacting with the Interface

1. **Home Page**

   - Navigate to `http://localhost:8000/`.
   - Use the **Add Input Area** button to add multiple input fields.
   - Select predefined files to insert content or type your custom text.
   - Choose the desired OpenAI model from the dropdown.

2. **Sending a Request**

   - Click on **Call API** to send the input to the backend.
   - The response will be displayed below, formatted with proper Markdown and syntax highlighting.

3. **Managing Code Blocks**

   - Code blocks in the response have options to **Copy** or **Save** the code.
   - Use the **Save** button to save the code to a file. You can select a predefined path or specify a custom path.

4. **Settings Page**

   - Navigate to `http://localhost:8000/settings`.
   - Set the base directory and manage predefined files.
   - Save the configuration to update the application's settings.

## Project Structure

```plaintext
├── main.py                 # FastAPI application
├── config/
│   └── config.json         # Configuration file for base directory and predefined files
├── static/
│   ├── styles.css          # Custom CSS styles
│   ├── uiComponents.js     # UI helper functions
│   ├── apiServices.js      # API interaction functions
│   ├── inputManager.js     # Dynamic input area management
│   └── icons/              # Icons for the UI
├── templates/
│   ├── index.html          # Main frontend page
│   └── settings.html       # Settings page
├── requirements.txt        # Python dependencies
└── README.md              # Project documentation
```

## API Endpoints

- **`GET /`**: Serves the main interface (`index.html`).

- **`GET /settings`**: Serves the settings interface (`settings.html`).

- **`POST /api/o1`**: Endpoint to interact with OpenAI models.

  - **Request Body**:

    ```json
    {
      "input": "Your input text",
      "model": "gpt-4"
    }
    ```

- **`GET /list_directory`**: Lists the contents of a directory.

  - **Query Parameter**: `path` - The directory path to list.

- **`POST /save_config`**: Saves the configuration settings.

- **`GET /get_config`**: Retrieves the current configuration.

- **`POST /save_code`**: Saves code content to a specified file path.

- **`GET /get_code`**: Retrieves the content of a specified file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

1. **Fork the Repository**

2. **Create a Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m 'Add your feature'
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Disclaimer**: This application requires an OpenAI API key and is intended for personal or development use. Please ensure compliance with OpenAI's usage policies when deploying and using this application.
