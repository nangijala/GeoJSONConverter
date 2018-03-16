const fs = require('fs');
const JSZip = require('jszip')



/**
 * Terms:
 * longitude (LON) Geographische länge (ost/west)
 * lattitude (LAT) Breitengrad
 */


function transformRange( value ){
    var fromTo = value.split('...')
    if( fromTo.length == 2){
        return [parseFloat(fromTo[0]), parseFloat(fromTo[1])]
    }        
    else   
        return [parseFloat(fromTo), parseFloat(fromTo)]
}

let args = require('parse-cli-arguments')({ 
    options:{
        fileName: { alias : 'f', defaultValue:'Gespeicherte Orte.json'},
        lon: { alias: 'o' , flag: 'lon', transform: transformRange , defaultValue:[-180,180]},
        lat: { alias: 'a' , flag: 'lat', transform: transformRange , defaultValue:[-90,90]},
        exportFormat : { alias: 'e' , flag: 'export', defaultValue : 'poi' },
        placesName: { alias: 'n', flag:'names', defaultValue: 'My places' }
    }
})

try{
    const places = require(`./${args.fileName}`);

var exportData = new Array
places.features.forEach((p)=>{
    const location = p.properties.Location;
    const geo = p.geometry;
    
    var lon = parseFloat(geo.coordinates[0])
    var lat = parseFloat(geo.coordinates[1])
    var name = location['Business Name'] ? location['Business Name'] : p.properties['Title']
    if(  lon >= args.lon[0] && lon <= args.lon[1] && lat >= args.lat[0] && lat <= args.lat[1]  ){
        if( args.exportFormat === 'poi'){
            exportData.push( `${lon},${lat},"${name}"` )
        }else if( args.exportFormat === 'kml' || args.exportFormat === 'kmz'){
            var pm =`<Placemark>
<name>${name}</name>
<Point><coordinates>${lon},${lat}</coordinates></Point>
</Placemark>`
            exportData.push( pm )
        }
        
    }
});

function exportKml( entries, args ){
    var ret=`<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://earth.google.com/kml/2.2">\n<Document>
<name>${args.placesName}</name>\n<visibility>1</visibility>`
    ret += exportData.join('\n')
    ret +=`</Document>\n</kml>\n`
    return ret
}

if( exportData.length > 0){
    if( args.exportFormat === 'kml'){
        console.log( exportKml(exportData, args) )
    }else if( args.exportFormat === 'kmz'){
        var zip = new JSZip();        
        zip
        .file(args.placesName + '.kml', exportKml(exportData, args) )
        .generateNodeStream({type:'nodebuffer',compression: 'DEFLATE', streamFiles:true})
        .pipe(fs.createWriteStream(args.placesName + '.kmz'))
        .on('finish', function () {
            console.log(args.placesName +  ".kmz written.");
        });  
    }else{
        console.log( exportData.join('\n'))
    }
    
}

}catch(err){
    console.log( err )
}


