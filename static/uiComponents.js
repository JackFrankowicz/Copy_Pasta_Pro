// Import the new function
import { saveCodeToFile, getPredefinedFiles, getBaseDirectory } from './apiServices.js';

export async function formatResponse(content, container) {
    // Get the base directory
    const baseDirectory = await getBaseDirectory();

    // Parse the markdown content
    const htmlContent = marked.parse(content);

    // Create a temporary container to manipulate the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Fetch predefined files for the dropdown
    const predefinedFiles = await getPredefinedFiles();

    // Find all code blocks and enhance them
    const codeBlocks = tempDiv.querySelectorAll('pre > code');
    codeBlocks.forEach((codeElement) => {
        const pre = codeElement.parentNode;

        // Add 'line-numbers' class to <pre> element for Prism
        pre.classList.add('line-numbers');

        // Create the header container for the code block
        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';

        // Create the file select dropdown
        const fileSelect = document.createElement('select');
        fileSelect.className = 'file-select';

        // Populate the file select dropdown
        // Placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Select file to save...';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        fileSelect.appendChild(placeholderOption);

        // Predefined files
        predefinedFiles.forEach((file) => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            fileSelect.appendChild(option);
        });

        // Add custom path option
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = 'Custom Path...';
        fileSelect.appendChild(customOption);

// Create custom file path input (hidden by default)
const customFileInput = document.createElement('input');
customFileInput.type = 'text';
customFileInput.value = baseDirectory || ''; // Pre-fill with base directory text
customFileInput.className = 'custom-file-input';
customFileInput.style.display = 'none';
        
        // Show or hide the custom file input based on selection
        fileSelect.addEventListener('change', () => {
            if (fileSelect.value === 'custom') {
                customFileInput.style.display = 'block';
            } else {
                customFileInput.style.display = 'none';
            }
        });

        // Create a container for fileSelect and customFileInput
        const fileSelectContainer = document.createElement('div');
        fileSelectContainer.style.display = 'flex';
        fileSelectContainer.style.flexDirection = 'column';

        // Append fileSelect and customFileInput to the container
        fileSelectContainer.appendChild(fileSelect);
        fileSelectContainer.appendChild(customFileInput);

        // Create the save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className = 'save-button';

        saveButton.addEventListener('click', async () => {
            // Disable the button to prevent multiple clicks
            saveButton.disabled = true;
            const originalText = saveButton.textContent;
            try {
                await saveCodeToFile(pre.querySelector('code'), fileSelect, customFileInput);
                saveButton.textContent = 'Saved!';
                // Optionally revert the button text after 2 seconds
                setTimeout(() => {
                    saveButton.textContent = originalText;
                    saveButton.disabled = false;
                }, 2000);
            } catch (error) {
                // Re-enable the button
                saveButton.disabled = false;
                // Show error popup
                alert('Error saving file: ' + (error.message || error));
            }
        });

        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-button';

        // Add event listener to the copy button
        copyButton.addEventListener('click', () => {
            copyCodeToClipboard(codeElement.textContent, copyButton);
        });

        // Append the container to codeHeader
        codeHeader.appendChild(fileSelectContainer);

        // Append save and copy buttons as before
        codeHeader.appendChild(saveButton);
        codeHeader.appendChild(copyButton);

        // Wrap pre and codeHeader in a container
        const codeContainer = document.createElement('div');
        codeContainer.className = 'code-container';
        pre.parentNode.replaceChild(codeContainer, pre);
        codeContainer.appendChild(codeHeader);
        codeContainer.appendChild(pre);
    });

    // Append the formatted content to the main container
    container.appendChild(tempDiv);

    // After content is added to the DOM, highlight code blocks
    Prism.highlightAll();
}

// Function to copy code to clipboard with feedback
export function copyCodeToClipboard(codeContent, copyButton) {
    navigator.clipboard.writeText(codeContent).then(() => {
        // Provide feedback to the user
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    }).catch((err) => {
        console.error('Failed to copy code: ', err);
    });
}
