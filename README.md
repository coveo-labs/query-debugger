# Query Debugger

This repository is a tool to help debugging Coveo queries.

# How to use

Starting from a V2 request, in Chrome's Network tab, copy the request using `Copy as cURL`:

![Copy as cURL](./docs/copyAsCurl.png)

Copy it in `input.txt`, text execute:

```
node index.js
```

The file `output.json` will have the request's data parsed properly in a nice JSON.
