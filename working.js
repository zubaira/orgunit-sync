'use strict';
const propertiesReader = require('properties-reader');
const http = require('https');
const fileSystem = require('fs');
const commandLineArg = require('minimist')(process.argv.slice(2))
const Client = require('node-rest-client').Client;  
const client = new Client();

let properies = loadProperties() ;
let postData = 'data';
let outPutFile = 'metadata_' + Date.now() +'.json';
let downloadServerAuth = 'Basic ' + Buffer.from(`${properies.get('download.server.username')}:${properies.get('download.server.password')}`).toString('base64');
let uploadServerAuth = 'Basic ' + Buffer.from(`${properies.get('upload.server.username')}:${properies.get('upload.server.password')}`).toString('base64');
let inMemoryData = null;

let getRequestArgs = {
    headers: { 
        "Content-Type": "application/json",
        "Authorization": downloadServerAuth,
        "Accept":"application/json"
    }
};

let downloadData = (getRequestArgs) => {
        return new Promise((resolve,reject) => {
            client.get( properies.get('download.server.url'), getRequestArgs, (data, response) => {
                    if ( response.statusCode === 200){
                        console.log('Connected to server: ' + properies.get('download.server.host') + ' with statusCode: ' + response.statusCode );
                        fileSystem.appendFile( outPutFile, JSON.stringify(data), function (err) {
                            if (err) return console.error(err);

                            inMemoryData = JSON.stringify(data);
                            resolve('Data downloaded in file: ' + outPutFile);
                            }); 
                    }
                    else{
                        reject('Connection with server ' + properies.get('download.server.host') +' refused with statusCode: ' + response.statusCode)
                    }
            
            });
        
        });
}

let uploadData = () => {
         return new Promise((resolve,reject) => {
            let postRequestArgs = {
                data:inMemoryData,
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": uploadServerAuth,
                  "Accept":"application/json"
                }
              };

             client.post( properies.get('upload.server.url'), postRequestArgs, (data, response) => {
                if ( response.statusCode === 200){
                    console.log('Connected to server: ' + properies.get('upload.server.host') + ' with statusCode: ' + response.statusCode );
                    console.log( JSON.stringify(data) );
                }
                else{
                    reject('Connection with server ' + properies.get('upload.server.host') +' refused with statusCode: ' + response.statusCode)
                   
                }
        });
    });
}

let startSynchronization = async () => {
    let downloadResponse = await downloadData(getRequestArgs).catch(error => {console.error(error); process.exit()});
    console.log(downloadResponse);

    let uploadResponse = await uploadData().catch(error => {console.error(error); process.exit()});
    console.log(uploadResponse);
}

startSynchronization();

function loadProperties()
{
    if ( !fileSystem.existsSync(commandLineArg['file'])){
        console.error('Properties file not found');
        process.exit();
    }

    console.log('Loading properties from file');
    return new propertiesReader(commandLineArg['file']);
}