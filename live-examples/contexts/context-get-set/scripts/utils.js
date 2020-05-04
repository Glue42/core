/* eslint-disable no-undef */
(function (window) {
  const toggleGlueAvailable = () => {
    const span = document.getElementById("glueSpan");
    span.classList.remove("badge-warning");
    span.classList.add("badge-success");
    span.textContent = "Connected";
  };

  const logger = (function logger() {
    function log(type, options) {
      const message = typeof options === 'string' ? options : options.message;
      const logTime = options != null && options.logTime === false ? false : true;

      const item = document.createElement('li');

      if (logTime) {
        const timeSpan = document.createElement('span');
        timeSpan.textContent = `[${formatTime(new Date())}] `;
        item.append(timeSpan);
      }

      item.classList.add(`list-group-item`);
      item.classList.add(`list-group-item-${type}`);
      item.append(message);

      document.getElementById('logs-list').prepend(item);
    }

    return {
      info(options) {
        log('', options);
      },
      error(options) {
        log('danger', options);
      },
      clear() {
        document.getElementById('logs-list').innerHTML = '';
      }
    }
  })();

  const setDocumentTitle = (title) => {
    document.title = title;
  }

  const displayAppName = (text) => {
    const el = document.getElementById('appNameHeading');
    if (el) {
      el.textContent = text;
    }
  }

  const formatTime = (date) => {
    if (date instanceof Date) {
      return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
    } else {
      return '';
    }
  }

  window.logger = logger;
  window.toggleGlueAvailable = toggleGlueAvailable;
  window.setDocumentTitle = setDocumentTitle;
  window.displayAppName = displayAppName;
  window.formatTime = formatTime;
})(window || {});
