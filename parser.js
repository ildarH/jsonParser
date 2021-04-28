const fileSelector = document.getElementById('file-selector');
const errorMessageDiv = document.getElementById('invalid');
const errorMesage = 'is not defined';
const formDiv = document.getElementById('formRoot');

fileSelector.addEventListener('change', readFile);

function readFile(event) {
  errorMessageDiv.innerHTML = '';
  errorMessageDiv.style.display = 'none';

  const file = event.target.files[0];
  const filename = (event.target.files[0].name).slice(0, -3) || '';
  reader = new FileReader();
  reader.readAsText(file);
  reader.onload = () => readData(reader.result, filename);
  reader.onerror = () => showErrorMessage(reader.error);
}

function readData(fileAsText, filename) {
  try {
    const data = ''.concat(fileAsText) || '';
    const obj = JSON.parse(data);
    parseObjToHtml(obj, filename);
  } catch (error) {
    showErrorMessage(error);
  }
}

function showErrorMessage(message) {
  const errorMessageSpan = `<span>${message}</span>`;
  errorMessageDiv.style.display = 'block';
  errorMessageDiv.insertAdjacentHTML('beforeend', errorMessageSpan);
  console.error(message);
}

function parseObjToHtml(obj, filename) {
  const header = obj.hasOwnProperty('name') ? obj.name : filename
  
  createFormTitle(header)
  
  obj.hasOwnProperty('fields')
    ? createFormFields(obj.fields)
    : showErrorMessage(`fields ${errorMesage}`);
}

function createFormTitle(str) {
  const regex = /_/;
  const title = (str.charAt(0).toUpperCase() + str.slice(1)).split(regex).join(' ');
  const formHeader = document.createElement('h2');
  formHeader.textContent = title;
  formHeader.id = 'formTitle';
  formHeader.classList = 'text-center';
  formDiv.appendChild(formHeader);
}

function createFormFields(arr) {
  if (!arr.length) return showErrorMessage(`arr ${errorMesage}`);

  const form = document.createElement('form')
  form.id = 'form'
  formDiv.appendChild(form)
  
  for (let input = 0; input < arr.length; input++) {
    
    createInputElement(arr[input], reserveId = input)

  }
}

function createInputElement(input, reserveId) {
  console.log('createInputElement', input);

  const isLabels = input.hasOwnProperty('label') ? true : false

  const id = isLabels ? (input.label).toLowerCase() : reserveId;

  const rowElement = document.createElement('div');
  const colElement = document.createElement('div');
  const inputElement = document.createElement('input');
  
  const attribute = input.input

  console.log('attr: ', attribute);

  rowElement.id = `${id}-row-id`;
  rowElement.classList = 'row mb-3';

  colElement.id = `${id}-col-id`;
  colElement.classList = 'col';

  inputElement.id = `${id}-input`;
  inputElement.classList = 'form-control';

  for (const [key, value] of Object.entries(attribute)) {
    inputElement.setAttribute(key, value)
    console.log(`${key}: ${value}`);
  }

  if (isLabels) {

    const labelElement = document.createElement('label');

    labelElement.classList = 'col-form-label';
    labelElement.htmlFor = `${id}-input`;
    labelElement.innerText = input.label;
    rowElement.appendChild(labelElement);

  }



  rowElement.appendChild(colElement);
  colElement.appendChild(inputElement);
  document.getElementById('form').appendChild(rowElement);
}