const elements = {
  fileInput: document.getElementById('fileInput'),
  sortOption: document.getElementById('sortOption'),
  fileList: document.getElementById('fileList'),
  downloadButton: document.getElementById('downloadButton'),
};

let textEntries = {};


elements.fileInput.addEventListener('change', handleFileInputChange);
elements.fileInput.addEventListener('change', updateDownloadButton);


elements.downloadButton.addEventListener('click', handleDownloadClick);
elements.fileList.addEventListener('click', handleButtonClicks);

function updateDownloadButton() {
  elements.downloadButton.style.display = elements.fileInput.files && elements.fileInput.files.length > 0 ? 'block' : 'none';
}


document.getElementById('fileInput').addEventListener('change', function() {
  var downloadButton = document.getElementById('downloadButton');
  if (this.files && this.files.length > 0) {
    downloadButton.style.display = 'block';
  } else {
    downloadButton.style.display = 'none';
  }
});


document.getElementById('fileInput').addEventListener('change', function() {
  var fileInputContainer = document.getElementById('fileInputContainer');
  var downloadButton = document.getElementById('downloadButton');

  if (this.files && this.files.length > 0) {
    fileInputContainer.style.display = 'none';
    downloadButton.style.display = 'block';
  }
});

function updateSort() {
  const files = Array.from(elements.fileList.querySelectorAll('.file-item'));
  files.sort((a, b) => {
    const numA = parseInt(a.textContent);
    const numB = parseInt(b.textContent);
    return numA - numB;
  });
  elements.fileList.innerHTML = '';
  files.forEach(file => elements.fileList.appendChild(file));
}

function handleFileInputChange(event) {
  elements.fileList.innerHTML = '';
  textEntries = {};
  const files = event.target.files;
  for (const file of files) {
    if (file.type === 'text/plain') {
      readTextFile(file);
    }
  }
}

function readTextFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const fileContent = e.target.result;
    const fileId = Date.now();
    const doi = getDOIFromText(fileContent);
    textEntries[fileId] = '';
    const fileDiv = createFileDiv(file.name, fileContent, fileId, doi);
    fileList.appendChild(fileDiv);
    updateSort();
  };
  reader.readAsText(file);
}

function createFileDiv(fileName, fileContent, fileId, doi) {
  const fileDiv = document.createElement('div');
  fileDiv.classList.add('file-item');
  fileDiv.innerHTML = DOMPurify.sanitize(`
  <na>${fileName.split('.').slice(0, -1).join('.')}</na>
  ${createCheckButton(fileId, doi).outerHTML}
  ${createNoButton().outerHTML}
  <p>
  <pre>${highlightLinks(fileContent)}</pre>
  <div class="textarea-container">
    <textarea id="file_${fileName}_${doi}" data-file-id="${fileId}" rows="1" cols="30" name="fileTextArea_${fileId}" placeholder=" "></textarea>
  </div>
`);
  return fileDiv;
}

function getDOIFromText(text) {
  const doiRegex = /\b(10\.\d{4,}(?:\.\d+)*\/\S+)\b/g;
  const matches = text.match(doiRegex);
  return matches ? matches[0] : '';
}

function highlightLinks(text) {
  const doiRegex = /\b(10\.\d{4,}(?:\.\d+)*\/\S+)\b/g;
  return text.replace(doiRegex, '<a href="https://doi.org/$1" target="_blank">READ</a>');
}

function createCheckButton(fileId, doi) {
  const checkButton = document.createElement('button');
  checkButton.textContent = 'YES';
  checkButton.classList.add('check-button');
  checkButton.setAttribute('data-doi', doi);
  return checkButton;
}


function createNoButton() {
  const NoButton = document.createElement('button');
  NoButton.textContent = 'NO';
  NoButton.classList.add('no-button');
  return NoButton;
}

function handleButtonClicks(event) {
  if (event.target && event.target.classList.contains('check-button')) {
    const doi = event.target.getAttribute('data-doi');
    const textarea = event.target.parentElement.querySelector('textarea');
    textarea.value = doi;
    
  }
  if (event.target && event.target.classList.contains('no-button')) {
    const textarea = event.target.parentElement.querySelector('textarea');
    textarea.value = "";
    event.target.parentElement.style.display = 'none';
  }
}


function handleDownloadClick() {
  const textData = [];
  const textareas = fileList.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    const fileId = textarea.getAttribute('data-file-id');
    const text = textarea.value.trim();
    if (text !== '') {
      textData.push(text);
    }
    textEntries[fileId] = text;
  });

  const textBlob = new Blob([textData.join('\n')], { type: 'text/plain' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(textBlob);
  downloadLink.download = 'saved.txt';
  downloadLink.click();
}

window.addEventListener('beforeunload', function (event) {
  event.preventDefault();
  event.returnValue = '';
});

window.addEventListener('unload', function (event) {
  event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
});
