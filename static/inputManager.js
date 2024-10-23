import { loadFileContentIntoTextarea } from './apiServices.js';

// Function to fetch available files from the server and return them as an array
async function fetchAvailableFiles() {
  try {
    const response = await fetch('/config/config.json');
    const config = await response.json();
    return config.predefinedFiles || [];
  } catch (error) {
    console.error('Error fetching available files:', error);
    return [];  // Return an empty array in case of an error
  }
}

// Function to add a new input area with drag handle
export async function addInputArea(initialValue = '') {
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

  // Fetch available files dynamically from the server
  const availableFiles = await fetchAvailableFiles();

  // Dynamically populate the file select with available files
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
    addInputArea(); // Call the same function to add more areas
  });

  // Add event listener to the remove button
  removeButton.addEventListener('click', function (event) {
    event.preventDefault();
    if (inputAreasContainer.childElementCount > 1) {
      inputAreasContainer.removeChild(inputArea);
    } else {
      alert('At least one input area must remain.');
    }
  });
}
