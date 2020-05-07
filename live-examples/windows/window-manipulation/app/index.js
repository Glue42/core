/* eslint-disable no-undef */
const APP_NAME = 'App A';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    const form = getFormElement();
    form.addEventListener('submit', openOrUpdateWindowHandler, false);
  })
  .catch(console.error);

function openWindow({ name, ...createOptions }) {
  return glue.windows.open(name, `${window.location.origin}/new-window/index.html`, createOptions);
}

function openOrUpdateWindowHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  const form = getFormElement();
  if (form.checkValidity() === false) {
    // Form is invalid. Mark fields.
    form.classList.add('was-validated');
    return;
  }
  form.classList.remove('was-validated');

  const { windowName, context, top, left, width, height } = getFormData();

  // Convert form data to web window options.
  const windowOptions = {
    name: windowName,
    context: { value: context },
    top: (isNaN(top) || top < 0) ? 50 : top,
    left: (isNaN(left) || left < 0) ? 50 : left,
    width: (isNaN(width) || width <= 0) ? 350 : width,
    height: (isNaN(height) || height <= 0) ? 300 : height,
  };

  const action = getSelectedAction();
  if (action === 'open') {
    openWindow(windowOptions);
  } else if (action === 'update') {
    const webWindow = glue.windows.list().find(({ name }) => name === windowName);
    if (webWindow) {
      webWindow.moveTo(windowOptions.top, windowOptions.left);
      webWindow.resizeTo(windowOptions.width, windowOptions.height);
      webWindow.setContext(windowOptions.context);
    }
  }
}

function actionChangedHandler() {
  const action = getSelectedAction();

  toggleFormOnWindowActionChanged(action);
  resetForm();

  if (action === 'update') {
    const windows = glue.windows.list().filter(({ name }) => {
      const myName = glue.windows.my().name;
      return name !== myName;
    });

    setWindowOptions(windows);
    selectedWindowChanged();
  }
}

async function selectedWindowChanged() {
  const windowName = getSelectedWindowName();
  const webWindow = glue.windows.list().find(({ name }) => name === windowName);

  if (webWindow) {
    const [bounds, contextData] = await Promise.all([
      webWindow.getBounds(),
      webWindow.getContext(),
    ]);

    setFormData({
      windowName,
      context: contextData.value,
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    });
  }
}

// DOM manipulation utils.

function toggleFormOnWindowActionChanged(action) {
  const isOpen = action === 'open';
  document.getElementById('windowNameInput').style.display = isOpen ? 'block' : 'none';
  document.getElementById('windowNameSelect').style.display = isOpen ? 'none' : 'block';
  document.getElementById('openWindowBtn').innerText = isOpen ? 'Open' : 'Update';
}

function getFormData() {
  function getElementValue(id) {
    const el = document.getElementById(id) || {};
    return el.value;
  }

  const windowName = getElementValue('windowNameInput');
  const context = getElementValue('contextInput');
  const top = Number(getElementValue('topPositionInput'));
  const left = Number(getElementValue('leftPositionInput'));
  const width = Number(getElementValue('widthInput'));
  const height = Number(getElementValue('heightInput'));

  return { windowName, context, top, left, width, height };
}

function setFormData({ windowName, context, top, left, width, height }) {
  function setElementValue(id, value) {
    const el = document.getElementById(id) || {};
    el.value = value;
  }

  setElementValue('windowNameInput', windowName || '');
  setElementValue('contextInput', context || '');
  setElementValue('topPositionInput', top || '');
  setElementValue('leftPositionInput', left || '');
  setElementValue('widthInput', width || '');
  setElementValue('heightInput', height || '');
}

function resetForm() {
  getFormElement().classList.remove('was-validated');

  setFormData({
    windowName: '',
    context: '',
    height: '',
    width: '',
    top: '',
    left: ''
  });
}

function setWindowOptions(windows) {
  const select = document.getElementById('windowNameSelect');
  select.innerHTML = '';

  windows.forEach((win) => {
    const el = document.createElement('option');
    el.text = win.name;
    el.value = win.name;

    select.appendChild(el);
  });
}

function getSelectedWindowName() {
  const windowNameSelect = document.getElementById("windowNameSelect");
  const windowNameSelectedOption = windowNameSelect.options[windowNameSelect.selectedIndex];
  return windowNameSelectedOption == null ? '' : windowNameSelectedOption.value;
}

function getFormElement() {
  return document.getElementById('openOrUpdateWindowForm');
}

function getSelectedAction() {
  const actions = document.getElementsByName('windowAction');
  const selected = Array.from(actions).find(x => x.checked);
  return selected == null ? '' : selected.value;
}
