// /home/jack/aaaDEV/static/script.js

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

        // Display "There it is!" message at the top
        responseDiv.innerHTML = '';
        const completionMessage = document.createElement('div');
        completionMessage.innerHTML = `There it is! Total time taken: <span>(${elapsedTime} seconds)</span>`;
        responseDiv.appendChild(completionMessage);

        // Format and display the response
        formatResponse(response.data, responseDiv);

    } catch (error) {
        clearInterval(timerInterval);
        responseDiv.textContent = `Error: ${error.message}`;
    }
}

function formatResponse(responseText, responseDiv) {
    // Convert markdown to HTML using Marked.js
    const htmlContent = marked.parse(responseText);

    // Create a container for the content
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = htmlContent;

    // Define available files and base directory
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
        // Add 'line-numbers' class to <pre> element
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
        saveButton.onclick = () => saveCodeToFile(codeBlock, fileSelect, customFileInput);

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

function saveCodeToFile(codeBlock, fileSelect, customFileInput) {
    const codeContent = codeBlock.textContent;
    let filePath = fileSelect.value;
    if (filePath === 'custom') {
        // Get custom file path from input
        const customPath = customFileInput.value.trim();
        if (!customPath) {
            alert('Please enter a valid file path.');
            return;
        }
        // Ensure the custom path is within the base directory
        filePath = customPath;
    }

    // Send the code and file path to the backend API
    axios.post('/save_code', {
        code: codeContent,
        file_path: filePath
    }).then(response => {
        alert('Code saved successfully!');
    }).catch(error => {
        alert('Failed to save code: ' + error.message);
    });
}

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

// Function to add a new input area
function addInputArea() {
    const inputAreasContainer = document.getElementById('input-areas-container');

    // Create the input area container
    const inputArea = document.createElement('div');
    inputArea.className = 'input-area';

    // Create the file select label
    const fileSelectLabel = document.createElement('label');
    fileSelectLabel.className = 'file-select-label';
    fileSelectLabel.textContent = 'Load file content:';

    // Create the file select dropdown
    const fileSelect = document.createElement('select');
    fileSelect.className = 'file-select';
    // Add options to the select
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
        option.textContent = filePath === '' ? 'Select a file to load...' : filePath;
        fileSelect.appendChild(option);
    });

    // Create the input textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'input-textarea';
    textarea.placeholder = 'Enter your text here...';

    // Create the remove input area button
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-input-button';
    removeButton.textContent = 'Remove Input Area';

    // Append elements to input area container
    inputArea.appendChild(fileSelectLabel);
    inputArea.appendChild(fileSelect);
    inputArea.appendChild(textarea);
    inputArea.appendChild(removeButton);

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

    // Add event listener to the remove button
    removeButton.addEventListener('click', function() {
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
        // Set the content to the textarea
        textarea.value = response.data;
    })
    .catch(error => {
        alert('Failed to load file: ' + error.response.data);
    });
}

// On page load, initialize the first input area
document.addEventListener('DOMContentLoaded', function() {
    // The first input area is already in the HTML, so just need to attach event listeners
    const firstInputArea = document.querySelector('.input-area');
    if (firstInputArea) {
        const fileSelect = firstInputArea.querySelector('.file-select');
        const textarea = firstInputArea.querySelector('.input-textarea');
        const removeButton = firstInputArea.querySelector('.remove-input-button');

        // Add event listener to the file select
        fileSelect.addEventListener('change', function() {
            const filePath = this.value;
            if (filePath) {
                loadFileContentIntoTextarea(filePath, textarea);
            } else {
                textarea.value = '';
            }
        });

        // Add event listener to the remove button
        removeButton.addEventListener('click', function() {
            const inputAreasContainer = document.getElementById('input-areas-container');
            inputAreasContainer.removeChild(firstInputArea);
        });
    }

    // Add event listener to the 'Add Input Area' button
    document.getElementById('add-input-button').addEventListener('click', function() {
        addInputArea();
    });
});
