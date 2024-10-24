import { addInputArea } from './inputManager.js';
import { loadFileContentIntoTextarea, sendRequest, getPredefinedFiles } from './apiServices.js';

let inputAreasContainer;

document.addEventListener('DOMContentLoaded', async function () {
  inputAreasContainer = document.getElementById('input-areas-container');

  // Initialize SortableJS for draggable input areas
  Sortable.create(inputAreasContainer, {
    animation: 150,
    handle: '.drag-handle',
  });

  // Fetch predefined files
  const predefinedFiles = await getPredefinedFiles();

  // Add the initial input area dynamically
  addInputArea('', null, predefinedFiles);

  // Attach event listener to submit button
  const submitButton = document.getElementById('submit-button');
  submitButton.addEventListener('click', sendRequest);

  // Attach event listener to copy all text button
  const copyAllButton = document.getElementById('copy-all-button');
  copyAllButton.addEventListener('click', copyAllText);

  // Event delegation for dynamic content
  inputAreasContainer.addEventListener('change', function (event) {
    if (event.target && event.target.classList.contains('file-select')) {
      const fileSelect = event.target;
      const textarea = fileSelect.closest('.input-area').querySelector('.input-textarea');
      const filePath = fileSelect.value;
      if (filePath) {
        loadFileContentIntoTextarea(filePath, textarea);
      } else {
        textarea.value = '';
      }
    }
  });
});

function copyAllText() {
  const textareas = document.querySelectorAll('.input-textarea');
  let combinedText = '';
  textareas.forEach((textarea) => {
    if (textarea.value.trim() !== '') {
      combinedText += textarea.value + '\n';
    }
  });

  const copyAllButton = document.getElementById('copy-all-button');

  navigator.clipboard.writeText(combinedText).then(() => {
    // Provide feedback to the user
    const originalText = copyAllButton.textContent;
    copyAllButton.textContent = 'Copied!';
    copyAllButton.disabled = true;
    setTimeout(() => {
      copyAllButton.textContent = originalText;
      copyAllButton.disabled = false;
    }, 2000);
  }).catch((err) => {
    console.error('Failed to copy text: ', err);
  });
}
