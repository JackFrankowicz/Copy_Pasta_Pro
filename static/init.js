import { addInputArea } from './inputManager.js';
import { loadFileContentIntoTextarea, sendRequest } from './apiServices.js';

document.addEventListener('DOMContentLoaded', function () {
  const inputAreasContainer = document.getElementById('input-areas-container');

  // Initialize SortableJS for draggable input areas
  Sortable.create(inputAreasContainer, {
    animation: 150,
    handle: '.drag-handle',
  });

  // Initialize the first input area if it exists
  const firstInputArea = document.querySelector('.input-area');
  if (firstInputArea) {
    initializeInputArea(firstInputArea);
  } else {
    // If no input areas exist, add one with pre-filled text
    const preFilledText = 'Return the complete code of the files with suggested edits, do not ask me to insert existing code';
    addInputArea(preFilledText);
  }

  // Attach event listener to submit button
  const submitButton = document.getElementById('submit-button');
  submitButton.addEventListener('click', sendRequest);

  // Attach event listener to copy all text button
  const copyAllButton = document.getElementById('copy-all-button');
  copyAllButton.addEventListener('click', copyAllText);

  // Attach file select event listeners after dynamic content is loaded
  const fileSelects = document.querySelectorAll('.file-select');
  fileSelects.forEach(fileSelect => {
    fileSelect.addEventListener('change', function () {
      const textarea = fileSelect.closest('.input-area').querySelector('.input-textarea');
      const filePath = this.value;
      if (filePath) {
        loadFileContentIntoTextarea(filePath, textarea);
      } else {
        textarea.value = '';
      }
    });
  });
});

// Initialize input area function
function initializeInputArea(inputArea) {
  const fileSelect = inputArea.querySelector('.file-select');
  const textarea = inputArea.querySelector('.input-textarea');
  const addButton = inputArea.querySelector('.add-input-button');
  const removeButton = inputArea.querySelector('.remove-input-button');

  // Update the placeholder option
  fileSelect.querySelector('option[value=""]').textContent = 'Insert context...';

  // Add event listeners
  fileSelect.addEventListener('change', function () {
    const filePath = this.value;
    if (filePath) {
      loadFileContentIntoTextarea(filePath, textarea);
    } else {
      textarea.value = '';
    }
  });

  addButton.addEventListener('click', function (event) {
    event.preventDefault();
    addInputArea();
  });

  removeButton.addEventListener('click', function (event) {
    event.preventDefault();
    inputAreasContainer.removeChild(inputArea);
  });

  const preFilledText = 'Return the complete code of the files with suggested edits, do not ask me to insert existing code';
  textarea.value = preFilledText;
}

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
