export const TEMPLATE_HTML = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%title%></title>
    <script>
        window.__moss_doc_link = '<%doc_link%>'
    </script>
</head>
<body>
<div id="app"></div>
<script src="./index.js"></script>
</body>
</html>
`

export const readme = `
_supported by moss.design_
`