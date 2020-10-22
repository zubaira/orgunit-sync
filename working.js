const propertiesReader = require('properties-reader');
const http = require('https');
const fileSystem = require('fs');
const args = require('minimist')(process.argv.slice(2))

//TODO get it from command line
let properies = propertiesReader( args['file'] );
let postData = 'data';
let outPutFile = 'metadata_' + Date.now() +'.json';
let downloadServerAuth = 'Basic ' + Buffer.from(`${properies.get('download.server.username')}:${properies.get('download.server.password')}`).toString('base64');
let uploadServerAuth = 'Basic ' + Buffer.from(`${properies.get('upload.server.username')}:${properies.get('upload.server.password')}`).toString('base64');

let getOptions = {
	"method": "GET",
	"hostname": properies.get('download.server.host'),
	"path": '/dev/api/metadata.json?skipSharing=false&download=true&organisationUnits=true&organisationUnitGroups=true&organisationUnitGroupSets=true',
	"headers": {
	  "Content-Type": "application/json",
	  "Authorization": downloadServerAuth,
	  "Accept":"application/json"
	}
  };

  let postOptions = {
	"method": "POST",
	"hostname": properies.get('upload.server.host'),
	"path": '/tracker/api/metadata.json',
	"headers": {
	  "Content-Type": "application/json",
	  "Authorization": uploadServerAuth,
	  "Accept":"application/json"
	}
  };


let downloadOrgUnitData = ( getOptions ) => {

    let data = [];
    return new Promise( (resolve,reject) => {
        const req = http.request( getOptions, res => {
            if ( res.statusCode  === 200 ){
                console.log(`Connected to server: ${getOptions.hostname} with Status code ${res.statusCode}`);
            }
            else{
                reject( `Connection with server: ${getOptions.hostname} refused with Status code ${res.statusCode}` );
            }
            res.on('data', receivedData => {
                data.push( receivedData );                
            })
                .on( 'end', () => {
                    fileSystem.appendFile( outPutFile, data, function (err) {
                    if (err) return console.error(err);

                    resolve('OrganisationUnit data downloaded in file: ' + outPutFile );
                    }); 
                })
        });
        
        req.on('error', error => {
            reject(error);
          });
          
        req.end();
    });
}

let uploadOrgUnitData = ( postOptions ) => {
    return new Promise( (resolve,reject) => {
        const req = http.request( getOptions, res => {
            if ( res.statusCode  === 200 ){
            console.log(`Connected to server: ${postOptions.hostname} with Status code ${res.statusCode}`);
            }
            else{
                reject( `Connection with server: ${postOptions.hostname} refused with Status code ${res.statusCode}` );
            }
        });
        
        req.on('error', error => {
            reject(error);
          });
          
        req.end();
    });
}


let startSynchronization = async () => {
    let downloadResponse = await downloadOrgUnitData( getOptions ).catch( error => console.error( error ) );
    console.log( downloadResponse );

    let uploadResponse = await uploadOrgUnitData( postOptions ).catch( error => console.error( error));
    console.log( uploadResponse );
}


startSynchronization();