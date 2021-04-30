const formFileSelector = document.getElementById('form-file-selector');
const labelFileSelector = document.getElementById('label-file-selector');
const fileSelector = document.getElementById('file-selector');
const clearForm = document.getElementById('clear-form');
const formRoot = document.getElementById('formRoot');
const errorMessageDiv = document.getElementById('invalid');

const errorMesage = 'is not defined';

fileSelector.addEventListener('change', readFile);
clearForm.addEventListener('click', reset);

function reset(event) {
  event.preventDefault();
  formRoot.innerHTML = '';
  errorMessageDiv.innerHTML = '';
  errorMessageDiv.style.display = 'none';
  clearForm.style.display = 'none';
  fileSelector.style.display = 'block';
  labelFileSelector.innerText = 'Load JSON:';
  fileSelector.value = '';
}

function readFile(event) {
  const file = event.target.files[0];
  const filename = event.target.files[0].name.slice(0, -3) || '';

  fileSelector.style.display = 'none';
  labelFileSelector.innerText = '';
  clearForm.style.display = 'block';

  const reader = new FileReader();
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
  const { name, fields, references, buttons } = obj;
  const fragment = document.createDocumentFragment();
  const form = document.createElement('form');
  form.id = 'form';

  const header = name || filename;

  const title = createFormTitle(header);
  const inputs = createFormInputs(fields);
  const refs = references ? createReferences(references) : [];
  const control = buttons ? createButtons(buttons) : [];
  formRoot.append(title);
  formRoot.append(form);
  fragment.append(...inputs);
  fragment.append(control);
  fragment.append(refs);

  form.append(fragment);

  createMasks();
}

function createFormTitle(str) {
  const regex = /_/;
  const title = (str.charAt(0).toUpperCase() + str.slice(1)).split(regex).join(' ');
  const formHeader = document.createElement('h2');
  formHeader.textContent = title;
  formHeader.id = 'formTitle';
  formHeader.classList = 'text-center mt-3 mb-3';
  return formHeader;
}

function createFormInputs(inputs) {
  if (!inputs.length) return showErrorMessage(`inputs ${errorMesage}`);
  return inputs.reduce((current, next, index) => [...current, createInputElement(next, index)], []);
}

function createInputElement(input, reserveId = 0) {
  const regex = /[^\w]|[0-9]/g;
  const isLabelExist = input.hasOwnProperty('label') ? true : false;
  let id =
    isLabelExist && !!input.label.replace(regex, '') // check for non-latin id's
      ? input.label
          .toLowerCase()
          .replace(regex, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\s/g, '-')
      : reserveId;
  let {
    type,
    required,
    placeholder,
    mask,
    technologies,
    multiple,
    filetype,
    checked,
    colors,
  } = input.input;

  const inputElement = document.createElement('input');
  const labelElement = isLabelExist ? document.createElement('label') : null;
  const multipleFragment = document.createDocumentFragment();
  let multipleCheckboxElements;
  let arrayForCheckbox;

  const attribute = input.input || '';

  inputElement.id = `${id}-${type}`;

  switch (type) {
    case 'text':
    case 'number':
    case 'email':
    case 'textarea':
    case 'date':
    case 'file':
      inputElement.classList = 'form-control';
      if (filetype) inputElement.accept = filetype.map((file) => '.'.concat(file));
      break;
    case 'checkbox':
      inputElement.classList = 'form-check-input';
      attribute.checked = (checked == 'true')
      isLabelExist ? labelElement.classList = 'form-check-label' : '';
      break;
    case 'password':
      inputElement.classList = 'form-control';
      inputElement.autocomplete = 'on';
      break;
    case 'color':
    case 'technology':
      arrayForCheckbox = technologies || colors;
      multipleCheckboxElements = arrayForCheckbox.map((value) => {
        const labelMultipleElement = document.createElement('label');
        const inputMultipleElement = document.createElement('input');
        labelMultipleElement.classList = 'form-check-label';
        labelMultipleElement.htmlFor = value;
        if (colors) {
          labelMultipleElement.classList += ' color-label rounded-3';
          labelMultipleElement.style.backgroundColor = value;
        } else {
          labelMultipleElement.append(value);
        }
        inputMultipleElement.classList = 'form-check-input';
        inputMultipleElement.id = value;
        inputMultipleElement.type = 'checkbox';
        return createHtmlWrapper(
          { label: labelMultipleElement, input: inputMultipleElement },
          'checkbox',
        );
      });
      multipleFragment.append(...multipleCheckboxElements);
      break;
    default:
      break;
  }

  if (mask) {
    attribute.placeholder = mask;
    attribute.type = 'text';
    inputElement.dataset.mask = mask;
  }

  Object.assign(inputElement, attribute);

  if (isLabelExist) {
    labelElement.classList = 'col-form-label';
    labelElement.htmlFor = `${id}-${type}`;
    labelElement.append(input.label);
  }
  if (multipleFragment.childElementCount > 0)
    return createHtmlWrapper({ label: labelElement || '', input: multipleFragment }, 'field');
  return createHtmlWrapper({ label: labelElement || '', input: inputElement }, type);
}

function createButtons(buttons) {
  if (!buttons.length) return;
  const buttonsElement = buttons.map((button) => createButtonElement(button));
  return createHtmlWrapper({ buttons: buttonsElement }, 'buttons');
}

function createButtonElement(button) {
  const buttonElement = document.createElement('button');
  buttonElement.append(button.text);
  buttonElement.classList = 'btn btn-primary mx-1';
  return buttonElement;
}

function createReferences(references) {
  if (!references.length) return;
  const rowElement = document.createElement('div');
  const colElement = document.createElement('div');
  const fragment = document.createDocumentFragment();
  rowElement.classList = 'row mb-3 justify-content-evenly';
  colElement.classList = 'col-6';

  references.forEach((reference) => {
    const textWithoutRef = reference['text without ref'] || null;
    const text = reference.text || null;
    const link = reference.ref || null;
    const input = reference.input ? createInputElement(reference) : null;
    const spanElement = textWithoutRef ? document.createElement('span') : null;
    const linkElement = link ? document.createElement('a') : null;
    spanElement ? spanElement.append(textWithoutRef + ' ') : '';
    linkElement ? linkElement.append(text) : '';
    linkElement ? linkElement.href = link : '';
    fragment.append(spanElement || '', linkElement || '', input || '');
  });
  rowElement.append(colElement);
  colElement.append(fragment);
  const checkbox = colElement.querySelector('.form-check')
  checkbox ? checkbox.classList = 'form-check-inline' : '';
  return rowElement;
}

function createHtmlWrapper(elements, type) {
  const { label, input, buttons } = elements;
  const fragment = document.createDocumentFragment();
  const rowElement = document.createElement('div');
  const colElement = document.createElement('div');
  const checkboxWrapper = document.createElement('div');
  rowElement.classList = 'row mb-3';
  colElement.classList = 'col';
  rowElement.append(colElement);

  switch (type) {
    case 'text':
    case 'password':
    case 'number':
    case 'email':
    case 'file':
    case 'textarea':
    case 'date':
    case 'color':
    case 'field':
      label ? rowElement.append(label) : '';
      rowElement.append(colElement);
      colElement.append(input);
      fragment.append(rowElement);
      return fragment;

    case 'buttons':
      rowElement.append(colElement);
      colElement.append(...buttons);
      fragment.append(rowElement);
      return fragment;

    case 'checkbox':
      rowElement.append(colElement);
      colElement.append(checkboxWrapper);
      checkboxWrapper.classList = 'form-check';
      checkboxWrapper.append(input, label);
      fragment.append(checkboxWrapper);
      return fragment;

    default:
      return fragment;
  }
}

function createMasks() {
  const allMaskedInputs = document.querySelectorAll('[data-mask]');
  allMaskedInputs.forEach((input) => {
    let mask = input.dataset.mask;
    $(input).mask(mask);
  });
}
