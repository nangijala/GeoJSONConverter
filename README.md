# GeoJSONConverter

Tool to convert a GeoJSON as created via Google takeout (https://takeout.google.com).

By default, the code expects the file `Gespeicherte Orte.json`. 

Show all entries in "POI format"

`node main.js`


Filter entries from Cuba, output as kml:

`node main.js --lon "-90...-60" -e kml`

