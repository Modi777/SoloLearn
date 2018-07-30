// Browser Me - 2018-07-28 - Created by Modi
/******************************************************
Run a SoloLearn code in the Browser.
*******************************************************/
// Copyright (c) 2018 Modi (Reinhold Lauer)
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// global variables to store the separate and combined codes
var __htmlCode = "";  // html code will contain the combined code at the end
var __cssCode = "";  // css code from SoloLearn
var __jsCode = "";  // javascript code from SoloLearn

// log a message to desired location
function __log( message ) {
    console.log( message + '...' );
}

// download the combined code so that it can be executed
function __saveCodeAsBlob() {
    var codeAsBlob = new Blob([ __htmlCode ], { type: 'html' });
    
    var downloadLink = document.createElement("a");
    downloadLink.download = "SoloLearnCode.html";
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL !== null) { // Chrome allows the link to be clicked without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL( codeAsBlob );
    } 
    else { // Firefox requires the link to be added to the DOM before it can be clicked.
        downloadLink.href = window.URL.createObjectURL( codeAsBlob );
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild( downloadLink );
    }
    
    downloadLink.click();
}

// store the codes and combine into a single HTML if all loaded
function __storeCode( language, sourceCode ) {
    if ( language == 'markdown' ) { // show the about
        $( '#aboutArea' ).text( sourceCode );
        return;
    }
    
    __log ( 'Got ' + language + ' code with ' + sourceCode.length + ' byte' );
    if ( language == 'html' ) __htmlCode = sourceCode;
    if ( language == 'css' ) __cssCode = sourceCode;
    if ( language == 'js' ) __jsCode = sourceCode;

    // check if all codes have been loaded
    if ( __htmlCode.length > 1 && __cssCode.length > 1 && __jsCode.length > 1 ) {
        __log ( 'Got all codes');
        __htmlCode = __htmlCode.replace( '<\/head>', '<style>\n\n' + __cssCode + '\n\n<\/style><\/head>' );
        __htmlCode = __htmlCode.replace( '<\/body>', '<script>\n\n' + __jsCode + '\n\n<\/script><\/body>' );
    
        __saveCodeAsBlob();  // save the blob
    }
}

// load the code in the corresponding selection    
function __getCode( language, codePageOnSoloLearn ) { 
    __log( ' Requesting ' + language + ' code');
    
    // handle JavaScript special case
    var codeLocation = language == 'js' ? 'input.saveJsCode' : 'input.saveSourceCode'; 
    codeLocation = language == 'css' ? 'input.saveCssCode' : codeLocation;
    
    $.ajax({ 
        type: 'GET',
        url: 'https://cors-anywhere.herokuapp.com/' + codePageOnSoloLearn,
        dataType : 'html',
        success: function( data, status, xhr ) { // succeeded with the request
            if ( status == 'success' ) {
                var sourceCode = $( data ).find( codeLocation ).attr( 'value' ); 
                __storeCode( language, sourceCode );
            }
        },
        error: function( error ) {  // log any error
            $.ajax( { // try it the other way...
                type: 'GET',
                url: codePageOnSoloLearn,
                dataType : 'html',
                success: function( data, status, xhr ) { // succeeded with the request
                    if ( status == 'success' ) {
                        var sourceCode = $( data ).find( codeLocation ).attr( 'value' ); 
                        __storeCode( language, sourceCode );
                    }
                },
                error: function( error ) { // log any error maybe later
                    __log( 'Error: ' + error );
                }
            });
        }
    });
}

// load the codes from the SoloLearn codepage
function __loadCodes ( sCodePage ) {
    __getCode( 'html', sCodePage + '#html' );
    __getCode( 'css', sCodePage + '#css' );
    __getCode( 'js', sCodePage + '#js' );
}

function __logLocationInfo ( ) {
    __log ( 'URL ' + location.href );
    __log ( 'Protocol ' + location.protocol );
    __log ( 'Hostname ' + location.hostname );
    __log ( 'Pathname ' + location.pathname );
}

// document is loaded get the codes and set the call back
$( document ).ready( function( ) {
    if ( location.protocol == 'about:' ) { // if the code is running in the app
        alert ( 'I am running in the SoloLearn app but would like to be in your default browser...\n' +
                'Click on In Browser in the menu to launch me in your browser?' );
    }
    else if ( location.hostname == 'code.sololearn.com' ) { // if the code is running in the browser under SoloLearn
        if ( confirm ( 'I am running in your browser under SoloLearn but would like to be fullscreen...\n' +
                'Can you launch me after I have downloaded me?' ) ) {
            __loadCodes( location.href );
        }
    }
    else if ( location.protocol == 'https:' ) { // if the code is running in the browser downloaded from the web
        alert ( 'Thanks a lot for downloading me from the web running me in fullscreen mode!... ;-)' );
    }
    else if ( location.protocol == 'file:' ) { // if the code is running in the browser in a downloaded file
        alert ( 'Thanks a lot for downloading me to a file and running me in fullscreen mode!... ;-)' );
    }
    else { // no clue where the code is running
        alert ( 'I have no clue where I am running...\n' +
                'Check the the browser log for more information...' );
        __logLocationInfo( );
    }
});