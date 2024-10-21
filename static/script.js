// /home/jack/aaaDEV/static/script.js

async function sendRequest() {
    const input = document.getElementById('input').value;
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

    // Append copy buttons and line numbers to code blocks
    const codeBlocks = contentDiv.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentNode;
        // Add 'line-numbers' class to <pre> element
        pre.classList.add('line-numbers');

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-button';
        copyButton.onclick = () => copyCodeToClipboard(codeBlock, copyButton);

        // Wrap pre and copyButton in a container
        const codeContainer = document.createElement('div');
        codeContainer.className = 'code-container';
        pre.parentNode.replaceChild(codeContainer, pre);
        codeContainer.appendChild(pre);
        codeContainer.appendChild(copyButton);
    });

    responseDiv.appendChild(contentDiv);

    // After content is added to the DOM, highlight code blocks
    Prism.highlightAll();
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
