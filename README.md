# Query Debugger

This repository is a tool to help debugging Coveo queries.

## Project plan

Documentation & Plan in this [Google Doc](https://docs.google.com/document/d/1Bozqq9q9dxG91MV863KBWhqCoeN2dKH0cDGvapb8Gts/edit).

## How to use

Starting from a V2 request, in Chrome's Network tab, copy the request using `Copy as cURL`:

![Copy as cURL](./docs/copyAsCurl.png)

Copy it in `input.txt`, then execute:

```
node index.js
```

The file `output.json` will have the request's data parsed properly in a nice JSON.
