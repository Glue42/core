/* eslint-disable no-undef */
const APP_NAME = 'Application A';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(subscribeToWindowEvents)
  .then(() => {
    const form = getFormElement();
    form.addEventListener('submit', openWindowHandler, false);
  })
  .then(clearLogsHandler)
  .catch(console.error);

function subscribeToWindowEvents() {
  const isMyWindow = (windowId) => windowId === glue.windows.myWindow.id;

  glue.windows.onWindowAdded((webWindow) => {
    // When it is my window - do not log. Keep the logs list clean.
    if (isMyWindow(webWindow.id) === false) {
      logger.info(`Window with name "${webWindow.id}" opened.`);
    }
  });

  glue.windows.onWindowRemoved((webWindow) => {
    // When it is my window - do not log. Keep the logs list clean.
    if (isMyWindow(webWindow.id) === false) {
      logger.info(`Window with name "${webWindow.id}" closed.`);
    }
  });
}

function openWindow({ name, ...createOptions }) {
  return glue.windows.open(name, `${window.location.origin}/new-window/index.html`, createOptions);
}

function openWindowHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  const form = getFormElement();
  if (form.checkValidity() === false) {
    // Form is invalid. Mark fields.
    form.classList.add('was-validated');
    return;
  }

  form.classList.remove('was-validated');

  const { windowName, context, width, height } = getFormData();

  const createWindowOptions = {
    name: windowName,
    context: { value: context },
    width: (isNaN(width) || width <= 0) ? 350 : width,
    height: (isNaN(height) || height <= 0) ? 350 : height,
  };

  openWindow(createWindowOptions);
  resetForm();
}

function getFormData() {
  function getElementValue(id) {
    const el = document.getElementById(id) || {};
    return el.value;
  }

  const windowName = getElementValue('windowNameInput');
  const context = getElementValue('contextInput');
  const width = Number(getElementValue('widthInput'));
  const height = Number(getElementValue('heightInput'));

  return { windowName, context, width, height };
}

function setFormData({ windowName, context, width, height }) {
  function setElementValue(id, value) {
    const el = document.getElementById(id) || {};
    el.value = value;
  }

  setElementValue('windowNameInput', windowName || '');
  setElementValue('contextInput', context || '');
  setElementValue('widthInput', width || '');
  setElementValue('heightInput', height || '');
}

function resetForm() {
  getFormElement().classList.remove('was-validated');

  setFormData({
    windowName: '',
    context: '',
    height: '',
    width: ''
  });
}

function getFormElement() {
  return document.getElementById('openWindowForm');
}
