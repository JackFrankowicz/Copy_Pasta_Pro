// Function to format and display the response with Markdown and enhanced code blocks
function formatResponse(responseText, responseDiv) {
    // Convert markdown to HTML using Marked.js
    const htmlContent = marked.parse(responseText);

    // Create a container for the content
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = htmlContent;

    // Define available files and base directory (adjust as needed)
    const availableFiles = [
        'static/script.js',
        'static/styles.css',
        'index.html',
        'main.py',
        'test.py'
    ];
    const baseDirectory = '/home/jack/aaaDEV/';

    // Append copy buttons, file selection, and line numbers to code blocks
    const codeBlocks = contentDiv.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentNode;
        // Add 'line-numbers' class to <pre> element for Prism
        pre.classList.add('line-numbers');

        // Create the header container for the code block
        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';

        // Create the file select dropdown
        const fileSelect = document.createElement('select');
        fileSelect.className = 'file-select';

        // Add options to the select
        availableFiles.forEach(filePath => {
            const option = document.createElement('option');
            option.value = filePath;
            option.textContent = filePath;
            fileSelect.appendChild(option);
        });

        // Add an option for custom file path
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = 'Custom Path...';
        fileSelect.appendChild(customOption);

        // Create an input field for custom file path
        const customFileInput = document.createElement('input');
        customFileInput.type = 'text';
        customFileInput.placeholder = 'Enter custom file path...';
        customFileInput.style.display = 'none'; // Hide it initially
        customFileInput.className = 'custom-file-input';

        // When 'Custom Path...' is selected, show the input field
        fileSelect.addEventListener('change', () => {
            if (fileSelect.value === 'custom') {
                customFileInput.style.display = 'inline-block';
            } else {
                customFileInput.style.display = 'none';
            }
        });

        // Create the save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'save-button';
        saveButton.onclick = () => saveCodeToFile(codeBlock, fileSelect, customFileInput, saveButton);

        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-button';
        copyButton.onclick = () => copyCodeToClipboard(codeBlock, copyButton);

        // Append elements to the code header
        codeHeader.appendChild(fileSelect);
        codeHeader.appendChild(customFileInput);
        codeHeader.appendChild(saveButton);
        codeHeader.appendChild(copyButton);

        // Wrap pre and codeHeader in a container
        const codeContainer = document.createElement('div');
        codeContainer.className = 'code-container';
        pre.parentNode.replaceChild(codeContainer, pre);
        codeContainer.appendChild(codeHeader);
        codeContainer.appendChild(pre);
    });

    responseDiv.appendChild(contentDiv);

    // After content is added to the DOM, highlight code blocks
    Prism.highlightAll();
}

// Function to save code to a file via backend API
function saveCodeToFile(codeBlock, fileSelect, customFileInput, saveButton) {
    const codeContent = codeBlock.textContent;
    let filePath = fileSelect.value;
    if (filePath === 'custom') {
        // Get custom file path from input
        const customPath = customFileInput.value.trim();
        if (!customPath) {
            alert('Please enter a valid file path.');
            return;
        }
        // Ensure the custom path is within the base directory (optional security step)
        // if (!customPath.startsWith(baseDirectory)) {
        //     alert('Invalid file path.');
        //     return;
        // }
        filePath = customPath;
    }

    // Send the code and file path to the backend API
    axios.post('/save_code', {
        code: codeContent,
        file_path: filePath
    }).then(response => {
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Saved!';
        // Revert the button text back to "Save" after 2 seconds
        setTimeout(() => {
            saveButton.textContent = originalText;
        }, 2000);
    }).catch(error => {
        alert('Failed to save code: ' + (error.response?.data || error.message));
    });
}

// Function to copy code to clipboard
function copyCodeToClipboard(codeBlock, button) {
    const codeText = codeBlock.textContent;
    navigator.clipboard.writeText(codeText).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Existing sendRequest function with merged functionalities
async function sendRequest() {
    const textareas = document.querySelectorAll('.input-textarea');
    let input = '';
    textareas.forEach(textarea => {
        input += textarea.value + '\n'; // Add a newline between each textarea's content
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
        const response = await axios.post('/api/o1', {
            input: input,
            model: model
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

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
                input: 2.50 / 1000000,
                output: 10.00 / 1000000
            },
            'gpt-4o-mini': {
                input: 0.150 / 1000000,
                output: 0.600 / 1000000
            },
            'o1-preview': {
                input: 15.00 / 1000000,
                output: 60.00 / 1000000
            },
            'o1-mini': {
                input: 3.00 / 1000000,
                output: 12.00 / 1000000
            }
        };

        // Get the pricing for the selected model
        const modelPricing = pricing[model];

        // Calculate the total cost
        const inputCost = promptTokens * modelPricing.input;
        const outputCost = completionTokens * modelPricing.output;
        const totalCost = inputCost + outputCost;

        // Display "There it is!" message at the top with detailed token info
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

// Function to add a new input area with drag handle
function addInputArea(initialValue = '') { 
    const inputAreasContainer = document.getElementById('input-areas-container');

    // Create the input area container
    const inputArea = document.createElement('div');
    inputArea.className = 'input-area';

    // Create the drag handle
    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';

    // Append the drag handle to the input area
    inputArea.appendChild(dragHandle);

    // Create the file select dropdown
    const fileSelect = document.createElement('select');
    fileSelect.className = 'file-select';

    const availableFiles = [
        '',
        'static/script.js',
        'static/styles.css',
        'index.html',
        'main.py',
        'test.py'
    ];
    availableFiles.forEach(filePath => {
        const option = document.createElement('option');
        option.value = filePath;
        option.textContent = filePath === '' ? 'Insert context...' : filePath;
        fileSelect.appendChild(option);
    });
    
    // Create the input textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'input-textarea';
    textarea.placeholder = 'Enter your text here...';
    textarea.value = initialValue; // Set initial value if provided

    // Create the buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'input-area-buttons';

    // Create the add input area button
    const addButton = document.createElement('button');
    addButton.className = 'add-input-button';
    addButton.title = 'Add Input Area';
    addButton.innerHTML = '<i class="fas fa-plus"></i>';

    // Create the remove input area button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-input-button';
    removeButton.title = 'Remove Input Area';
    removeButton.innerHTML = '<i class="fas fa-minus"></i>';

    // Append buttons to buttons container
    buttonsContainer.appendChild(addButton);
    buttonsContainer.appendChild(removeButton);

    // Append elements to input area container
    inputArea.appendChild(fileSelect);
    inputArea.appendChild(textarea);
    inputArea.appendChild(buttonsContainer);

    // Append the input area to the container
    inputAreasContainer.appendChild(inputArea);

    // Add event listener to the file select
    fileSelect.addEventListener('change', function() {
        const filePath = this.value;
        if (filePath) {
            loadFileContentIntoTextarea(filePath, textarea);
        } else {
            textarea.value = '';
        }
    });

    // Add event listener to the add button
    addButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent form submission or other default actions
        addInputArea();
    });

    // Add event listener to the remove button
    removeButton.addEventListener('click', function(event) {
        event.preventDefault();
        inputAreasContainer.removeChild(inputArea);
    });
}

// Function to load file content into a specific textarea
function loadFileContentIntoTextarea(filePath, textarea) {
    axios.get('/get_code', {
        params: {
            file_path: filePath
        }
    })
    .then(response => {
        textarea.value = response.data;
    })
    .catch(error => {
        alert('Failed to load file: ' + (error.response?.data || error.message));
    });
}

// On page load, initialize the input areas and SortableJS
document.addEventListener('DOMContentLoaded', function() {
    const inputAreasContainer = document.getElementById('input-areas-container');

    // Initialize SortableJS for draggable input areas
    var sortable = Sortable.create(inputAreasContainer, {
        animation: 150,
        handle: '.drag-handle',
    });

    // Initialize the first input area if it exists
    const firstInputArea = document.querySelector('.input-area');
    if (firstInputArea) {
        const fileSelect = firstInputArea.querySelector('.file-select');
        const textarea = firstInputArea.querySelector('.input-textarea');
        const addButton = firstInputArea.querySelector('.add-input-button');
        const removeButton = firstInputArea.querySelector('.remove-input-button');

        // Update the placeholder option
        fileSelect.querySelector('option[value=""]').textContent = 'Insert context...';

        // Add event listeners
        fileSelect.addEventListener('change', function() {
            const filePath = this.value;
            if (filePath) {
                loadFileContentIntoTextarea(filePath, textarea);
            } else {
                textarea.value = '';
            }
        });

        addButton.addEventListener('click', function(event) {
            event.preventDefault();
            addInputArea();
        });

        removeButton.addEventListener('click', function(event) {
            event.preventDefault();
            inputAreasContainer.removeChild(firstInputArea);
        });

        const preFilledText = "Return the complete code of the files with suggested edits, do not ask me to insert existing code";
        textarea.value = preFilledText;
    } else {
        // If no input areas exist, add one with pre-filled text
        const preFilledText = "Return the complete code of the files with suggested edits, do not ask me to insert existing code";
        addInputArea(preFilledText);
    }
});
