// inputManager.js

import { loadFileContentIntoTextarea } from './apiServices.js';

// Function to add a new input area with drag handle
export function addInputArea(initialValue = '') {
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
    'test.py',
  ];
  availableFiles.forEach((filePath) => {
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
  fileSelect.addEventListener('change', function () {
    const filePath = this.value;
    if (filePath) {
      loadFileContentIntoTextarea(filePath, textarea);
    } else {
      textarea.value = '';
    }
  });

  // Add event listener to the add button
  addButton.addEventListener('click', function (event) {
    event.preventDefault();
    addInputArea();
  });

  // Add event listener to the remove button
  removeButton.addEventListener('click', function (event) {
    event.preventDefault();
    inputAreasContainer.removeChild(inputArea);
  });
}
