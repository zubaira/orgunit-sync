
const http = require('https');
const fileSystem = require('fs');

let postData = 'data';
let outPutFile = 'metadata_' + Date.now() +'.json';
let downloadServerAuth = 'Basic ' + Buffer.from('admin:').toString('base64');
let uploadServerAuth = 'Basic ' + Buffer.from('admin:').toString('base64');

//TODO get it from command line
let downloadServerHost = 'play.dhis2.org';
let uploadServerHost = "dhis2.ntp.gov.pk";

let getOptions = {
	"method": "GET",
	"hostname": downloadServerHost,
	"path": '/dev/api/metadata.json?skipSharing=false&download=true&organisationUnits=true&organisationUnitGroups=true&organisationUnitGroupSets=true',
	"headers": {
	  "Content-Type": "application/json",
	  "Authorization": downloadServerAuth,
	  "Accept":"application/json"
	}
  };

  let postOptions = {
	"method": "POST",
	"hostname": uploadServerHost,
	"path": '/tracker/api/metadata.json',
	"headers": {
	  "Content-Type": "application/json",
	  "Authorization": uploadServerAuth,
	  "Accept":"application/json"
	}
  };


let downloadOrgUnitData = ( getOptions ) => {

    return new Promise( (resolve,reject) => {
        const req = http.request( getOptions, res => {
            if ( res.statusCode  === 200 ){
                console.log(`Connected to server: ${getOptions.hostname} with Status code ${res.statusCode}`);
            }
            else{
                reject( `Connection with server: ${getOptions.hostname} refused with Status code ${res.statusCode}` );
            }
            res.on('data', receivedData => {
                    fileSystem.appendFile( outPutFile, receivedData, function (err) {
                        if (err) return console.error(err);
                        });                 
                  })
                .on( 'end', () => {
                    resolve('OrganisationUnit data downloaded in file: ' + outPutFile );
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


let startProgram = async () => {
    let downloadResponse = await downloadOrgUnitData( getOptions ).catch( error => console.error( error ) );
    console.log( downloadResponse );

    let uploadResponse = await uploadOrgUnitData( postOptions ).catch( error => console.error( error));
    console.log( uploadResponse );
}


startProgram();