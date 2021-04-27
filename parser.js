const fileSelector = document.getElementById('file-selector');
const errorMessageDiv = document.getElementById('invalid');

fileSelector.addEventListener('change', readFile);

function readFile(event) {

  errorMessageDiv.innerHTML = '';
  errorMessageDiv.style.display = 'none';

  const file = event.target.files[0];
  reader = new FileReader()
  reader.readAsText(file)
  try {
    reader.onload = () => readData(reader.result);
    reader.onerror = () => showErrorMessage(reader.error);
  } catch (e) {
    if (e.name == 'ReadError') {
      alert( e.message );
      alert( e.cause ); // оригинальная ошибка-причина
    } else {
      throw e;
    }
  }

}

function readData(fileAsText) {
  try {
    const data = ''.concat(fileAsText) || '';
    const obj = JSON.parse(data);
    console.log(obj);
  } catch (error) {
    showErrorMessage(error)
  }
}

function showErrorMessage(message) {
  this.message = message;
  this.name = 'ReadError';
  const errorMessageSpan = `<span>${message}</span>`;
  errorMessageDiv.style.display = 'block';
  errorMessageDiv.insertAdjacentHTML('beforeend', errorMessageSpan);
  console.error(message)
}
