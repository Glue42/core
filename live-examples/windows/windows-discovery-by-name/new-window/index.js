// Entry point. Initializes Glue42 Web. A Glue42 Web instance will be attached to the window.
window.startApp()
  .then(async () => {
    const windowName = await glue.windows.my().name;
    document.getElementById('windowNameText').textContent = windowName;

    const url = await glue.windows.my().getURL();
    document.getElementById('urlText').textContent = url;

    const context = await glue.windows.my().getContext();
    document.getElementById('contextText').textContent = context.value;
  })
  .catch(console.error);
