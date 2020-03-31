# Glue42 Web
Glue42 Web allows JavasScript applications to integrate with other applications, part of the same Glue42 Core project via a set of API. With Glue42 Web you can share data with other applications, expose functionality, manage windows and notifications.

## Referencing

Glue42 Web is available both as a single JavaScript file which you can include into your web applications using a `<script>` tag, and as a node.js module.
You can use Glue42 Web in a `script` tag include, e.g.:

```html
<script type="text/javascript" src="web.umd.js"></script>
```

...or as a node.js module.

``` javascript
const Glue = require("@glue42/web");
```

When deploying your application in production, we recommend that you always reference a specific **minified** version, e.g.:

```html
<script type="text/javascript" src="web.umd.min.js"></script>
```

## Initialization

When Glue42 Web is executed, it will attach a factory function to the global (window) object at runtime called **GlueWeb**. This factory function should be invoked with an optional onfiguration object to init the library and connect to the Glue42 Core Environment The factory function returns a Promise object.

Example:
```javascript
  GlueWeb()
    .then((glue) => {
      window.glue = glue;
    })
    .catch(console.log);
```