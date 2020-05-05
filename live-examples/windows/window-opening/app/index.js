/* eslint-disable no-undef */
const APP_NAME = 'App A';

// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    const form = document.getElementById('openWindowForm');
    form.addEventListener('submit', openWindowHandler, false);
  })
  .catch(console.error);

function openWindow({ name, ...createOptions }) {
  return glue.windows.open(name, `${window.location.origin}/new-window/index.html`, createOptions);
}
function openWindowHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  const form = document.getElementById('openWindowForm');
  if (form.checkValidity() === false) {
    // Form is invalid. Mark fields.
    form.classList.add('was-validated');
    return;
  }

  form.classList.remove('was-validated')

  const windowNameValue = getElementValue('windowNameInput');
  const contextValue = getElementValue('contextInput');
  const topValue = Number(getElementValue('topPositionInput'));
  const leftValue = Number(getElementValue('leftPositionInput'));
  const widthValue = Number(getElementValue('widthInput'));
  const heightValue = Number(getElementValue('heightInput'));

  const createWindowOptions = {
    name: windowNameValue,
    context: { message: contextValue },
    top: (isNaN(topValue) || topValue < 0) ? 50 : topValue,
    left: (isNaN(leftValue) || leftValue < 0) ? 50 : leftValue,
    width: (isNaN(widthValue) || widthValue <= 0) ? 350 : widthValue,
    height: (isNaN(heightValue) || heightValue <= 0) ? 300 : heightValue,
  };

  openWindow(createWindowOptions);
}

function getElementValue(id) {
  const el = document.getElementById(id) || {};
  return el.value;
}
