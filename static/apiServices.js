// apiServices.js

// Function to save code to a file via backend API
export async function saveCodeToFile(codeBlock, fileSelect, customFileInput) {
  const codeContent = codeBlock.textContent; // Grab the content of the code block
  let filePath = fileSelect.value; // Get the selected file path from dropdown

  // Check if the custom path option is selected
  if (filePath === 'custom') {
    const customPath = customFileInput.value.trim();
    if (!customPath) {
      alert('Please enter a valid custom file path.');
      return; // Exit if no custom path is provided
    }
    filePath = customPath;
  }

  try {
    // Make sure filePath and codeContent are valid
    if (!filePath || !codeContent) {
      alert("Missing file path or content. Ensure the code block and file path are filled in.");
      return;
    }

    // Send the code content to the backend for saving
    await axios.post('/save_code', {
      code: codeContent,
      file_path: filePath,
    });

    // Display success message
    alert(`Code saved to ${filePath} successfully!`);

  } catch (error) {
    // Show error message with details from backend
    alert(`Failed to save code: ${error.response?.data || error.message}`);
  }
}


// Function to load file content into a specific textarea
export async function loadFileContentIntoTextarea(filePath, textarea) {
  try {
    const response = await axios.get('/get_code', {
      params: { file_path: filePath },
    });
    textarea.value = response.data;
  } catch (error) {
    alert('Failed to load file: ' + (error.response?.data || error.message));
  }
}

// Function to send request to the backend API
export async function sendRequest() {
  const textareas = document.querySelectorAll('.input-textarea');
  let input = '';
  textareas.forEach((textarea) => {
    input += textarea.value + '\n';
  });

  const model = document.getElementById('model-select').value;
  const responseDiv = document.getElementById('response');
  responseDiv.innerHTML = '';

  // Set the loading message
  const whoompElement = document.createElement('div');
  whoompElement.id = 'whoomp';
  whoompElement.textContent = 'WHOOMP (0 seconds)';
  responseDiv.appendChild(whoompElement);

  // Start the timer
  const startTime = Date.now();
  const timerInterval = setInterval(() => {
    const currentTime = ((Date.now() - startTime) / 1000).toFixed(1);
    whoompElement.textContent = `WHOOMP (${currentTime} seconds)`;
  }, 100);

  try {
    const response = await axios.post(
      '/api/o1',
      {
        input: input,
        model: model,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Stop the timer
    clearInterval(timerInterval);
    const endTime = Date.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

    // Extract content and token usage from response
    const content = response.data.content;
    const promptTokens = response.data.prompt_tokens;
    const completionTokens = response.data.completion_tokens;
    const totalTokens = response.data.total_tokens;

    // Pricing per million tokens for each model
    const pricing = {
      'chatgpt-4o-latest': {
        input: 2.5 / 1_000_000,
        output: 10.0 / 1_000_000,
      },
      'gpt-4o-mini': {
        input: 0.15 / 1_000_000,
        output: 0.6 / 1_000_000,
      },
      'o1-preview': {
        input: 15.0 / 1_000_000,
        output: 60.0 / 1_000_000,
      },
      'o1-mini': {
        input: 3.0 / 1_000_000,
        output: 12.0 / 1_000_000,
      },
    };

    // Get the pricing for the selected model
    const modelPricing = pricing[model];

    // Calculate the total cost
    const inputCost = promptTokens * modelPricing.input;
    const outputCost = completionTokens * modelPricing.output;
    const totalCost = inputCost + outputCost;

    // Display the result
    responseDiv.innerHTML = '';
    const completionMessage = document.createElement('div');
    completionMessage.innerHTML = `
      <p>There it is!...Total time taken: <span>${elapsedTime} seconds</span></p>
      <p>Model used: <span>${model}</span></p>
      <p>Input tokens: <span>${promptTokens}</span> / Output tokens: <span>${completionTokens}</span></p>
      <p>Damage: <span>$${totalCost.toFixed(4)}</span></p>
    `;
    responseDiv.appendChild(completionMessage);

    // Format and display the response
    formatResponse(content, responseDiv);
  } catch (error) {
    clearInterval(timerInterval);
    responseDiv.textContent = `Error: ${error.response?.data || error.message}`;
  }
}
