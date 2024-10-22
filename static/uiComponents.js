// uiComponents.js

// Function to format and display the response with Markdown and enhanced code blocks
export function formatResponse(responseText, responseDiv) {
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
    'test.py',
  ];

  // Append copy buttons, file selection, and line numbers to code blocks
  const codeBlocks = contentDiv.querySelectorAll('pre code');
  codeBlocks.forEach((codeBlock) => {
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
    availableFiles.forEach((filePath) => {
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
    saveButton.onclick = () =>
      saveCodeToFile(codeBlock, fileSelect, customFileInput, saveButton);

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

// Function to copy code to clipboard
export function copyCodeToClipboard(codeBlock, button) {
  const codeText = codeBlock.textContent;
  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
}
