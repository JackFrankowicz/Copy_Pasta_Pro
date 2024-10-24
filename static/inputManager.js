import { loadFileContentIntoTextarea, getPredefinedFiles } from './apiServices.js';

// Function to add a new input area with drag handle
export async function addInputArea(initialValue = '', referenceNode = null, predefinedFiles = null) {
  const inputAreasContainer = document.getElementById('input-areas-container');

  if (!predefinedFiles) {
    // Fetch predefined files if not provided
    predefinedFiles = await getPredefinedFiles();
  }

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

  // Create the placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Insert context...';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  fileSelect.appendChild(placeholderOption);

  // Populate the file select dropdown
  predefinedFiles.forEach((file) => {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = file;
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

  // Insert the new input area after the referenceNode or append to the container
  if (referenceNode && referenceNode.parentNode === inputAreasContainer) {
    inputAreasContainer.insertBefore(inputArea, referenceNode.nextSibling);
  } else {
    inputAreasContainer.appendChild(inputArea);
  }

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
  addButton.addEventListener('click', async function (event) {
    event.preventDefault();
    // Fetch predefined files again in case they've changed
    const updatedPredefinedFiles = await getPredefinedFiles();
    addInputArea('', inputArea, updatedPredefinedFiles).then(() => {
      // Optionally scroll to the new input area
      if (inputArea.nextSibling) {
        inputArea.nextSibling.scrollIntoView({ behavior: 'smooth' });
      }
    });
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
