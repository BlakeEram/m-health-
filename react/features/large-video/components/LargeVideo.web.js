/* eslint-disable react/jsx-equals-spacing,max-len,react/jsx-sort-props,react/jsx-max-props-per-line,no-unused-expressions,no-trailing-spaces,no-alert,require-jsdoc,react/jsx-no-bind,indent,react/jsx-handler-names,no-unused-vars,newline-per-chained-call,newline-after-var,prefer-const,arrow-parens,object-shorthand,arrow-body-style,react/jsx-first-prop-new-line,brace-style */
/* @flow */
// do you see this

// imports
import PropTypes from 'prop-types';
import React, { Component } from 'react';

let JSZip = require('jszip');
let FileSaver = require('file-saver');
let mysql = require('mysql');
let builder = require('xmlbuilder');
let request = require('request');
const blobToBase64 = require('blob-to-base64')


import { VideoQualityLabel } from '../../video-quality';
import { RecordingLabel } from '../../recording';

import html2canvas from './html2canvas.js';
import MediaStreamRecorder from './MediaStreamRecorder.js';
declare var interfaceConfig: Object;

/**
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * the conference participant who is on the local stage) on Web/React.
 *
 * @extends Component
 *
 *
 *
 */

// https://localhost:8080/ElectricSurgeonsLovedRapidly?patient=false&firstName=Blake&lastName=Eram&patientID=0001&chiefComplaint=My%20Arm%20is%20hurting&medication=Advil&allergies=Honey
export default class LargeVideo extends Component<*> {
    // constructor

    constructor(props) {
        super(props);

        // declare functions for page
        this.handleClick = this.handleClick.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.takenPicture = this.takenPicture.bind(this);
        this.recordSnip = this.recordSnip.bind(this);
        this.recordCall = this.recordCall.bind(this);
        this.onMediaError = this.onMediaError.bind(this);
        this.zoomWebcam = this.zoomWebcam.bind(this);
        this.onFinishWithPatient = this.onFinishWithPatient.bind(this);
        this.mHealth = this.mHealth.bind(this);

        // get parameters from URL
        let urlParams;


        (window.onpopstate = function() {
            var match,
                pl     = /\+/g, //Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query  = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);
        })();

        // variable for todays date
        let today = new Date(),
            date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // variable for media constraints
        let mediaConstraints = {
            audio: true,
            video: true
        };

        // state variables
        this.state = {
            pictures: [],
            patientID: [ 'Not Available' ],
            nameP: [],
            names: [],
            button: [],
            conferenceID: [ 'Not Available' ],
            chiefcomplaint: [ 'Not Available' ],
            allergies: [ 'Not Available' ],
            medication: [ 'Not Available' ],
            reminders: [ 'Not Available' ],
            date: date,
            mediaConstraints: mediaConstraints,
            recording: false,
            mediaRecorder: [],
            snippetRecorder: [],
            snippetDone: false,
            zoomCanvas: [],
            zoom: false,
            zoomStrength: 1,
            finishedWithPatient: false,
            imgCanvas: [],
            selectedFile: 'hello',
            urlParams: urlParams
        };


    }

    // json fetching
    componentDidMount() {
        if (this.state.urlParams.chiefComplaint !== undefined) {
            this.state.chiefcomplaint = this.state.urlParams.chiefComplaint;
        }
        if (this.state.urlParams.allergies !== undefined) {
            this.state.allergies = this.state.urlParams.allergies;
        }
        if (this.state.urlParams.medication !== undefined) {
            this.state.medication = this.state.urlParams.medication;
        }
        if (this.state.urlParams.reminders !== undefined) {
            this.state.reminders = this.state.urlParams.reminders;
        }
        if (this.state.urlParams.conferenceId !== undefined) {
            this.state.conferenceID = this.state.urlParams.conferenceId;
        }
        if (this.state.urlParams.fname !== undefined) {
            this.state.nameP = this.state.urlParams.fname + ' ' + this.state.urlParams.lname;
        }

        // sets state to largeVideo
        if (this.state.urlParams.patient === 'false') {
            $('#videospace').animate({
                width: '50%'
            });
            document.getElementById('largeVideoWrapper').style.width = '50%';
            this.state.zoomCanvas = document.getElementById('largeVideo');

            // picture canvas
            let v = this.state.zoomCanvas;
            let imgCanvas = document.getElementById('imgCanvas');
            this.state.imgCanvas = imgCanvas;
            let ctx = imgCanvas.getContext('2d');
            let i;

            // plays video on canvas
            v.addEventListener('play', function() {
                i = window.setInterval( function() {
                    ctx.drawImage(v, 0, 0, 300, 150);
                }, 20);
            }, false);

        } else if (this.state.urlParams.patient === 'true') {
            let consent = false;
            while (consent === false) {
                const response = confirm('This session will be video-recorded for quality improvement purposes. Press Ok to accept');
                if (response === true) {
                    alert('You gave consent');
                    consent = true;
                } else {
                    alert('You did not give consent, the call will not continue, please give consent');
                }

            }
            document.getElementById('largeVideoWrapper').style.width = '70%';
            $('#videospace').animate({
                width: '70%'
            });


        } else {
            document.getElementById('largeVideoWrapper').style.width = '70%';
            $('#videospace').animate({
                width: '70%'
            });
        }

        // code to get information from either json or link parameters
        fetch('https://randomuser.me/api/?results=7').then(results => {
            return results.json();
        }).then(data => {

            // gets pictures from api
            let pictures = data.results.map((pic) => {
                return (
// eslint-disable-next-line react/jsx-key
                    <div>
                        <img src={ pic.picture.medium } />
                    </div>
                );
            });

            // get names from api
            let names = data.results.map((first) => {
                return (
// eslint-disable-next-line react/jsx-key
                    <div>
                        <p> {this.state.urlParams.name} </p>
                    </div>
                );
            });

            // gets patientId from api
            let patientId = data.results.map((patientID) => {
                return (
// eslint-disable-next-line react/jsx-key
                    <div>
                        <p>{this.state.urlParams.pId}</p>
                    </div>
                );
            });


            // sets the state to access variables from anywhere in the code
            this.setState({ pictures: pictures });
            this.setState({ names: names });
            this.setState({ patientID: patientId });




            // css for buttons
            let buttons = data.results.slice(1).map((first) => {
                let mediaButtons = {
                    width: '100%',
                    padding: 3
                };
                let hidden = {
                    width: '100%',
                    padding: 3,
                    visibility: 'hidden'
                };

                return (
// eslint-disable-next-line react/jsx-key
                    <div>
                        <p> {first.name.first}, {first.name.last} </p>
                        <button style = { mediaButtons } type= 'button' value='clickme' onClick ={ this.handleClick } > See {first.name.first}'s chart</button>
                        <button id = 'changeRoom' style = { hidden } type= 'button' value='clickme' onClick ={ this.handleRoomChange } >{first.name.first} is ready</button>
                        <br></br>
                    </div>

                );
            });
            this.setState({ button: buttons });
        });
    }

    static propTypes = {
        /**
         * True if the {@code VideoQualityLabel} should not be displayed.
         */
        hideVideoQualityLabel: PropTypes.bool

    };

    // take picture of the screen
    // todo send photo to the server
    takenPicture() {
        let a = document.createElement('a');
        let image;

        var d = new Date();
        var f = d.getDate()



        let cID = this.state.conferenceID.toString();



        // creates a new element to paste canvas
        if (this.state.zoomStrength === 1) {
            html2canvas(this.state.imgCanvas, {
                logging: true,
                profile: true,
                useCORS: true }).then(function(canvas) {
                // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                $.ajax({
                    url: "https://cmi.fast.sheridanc.on.ca:8080/uploadPhoto",
                    type: 'POST',
                    data: {
                        image: a.href,
                        cID: cID
                },
                    dataType: 'text',
                    method: 'POST',
                    success: function(response) {
                        console.log("success");
                    },
                    error: function(jqXHR, textStatus, errorMessage) {
                        console.log(errorMessage); // Optional
                    }
                });
                //a.download = cID + d + '.jpg';
                //a.click();
            });

        } else if (this.state.zoomStrength <= 2) {

            let v = document.getElementById('largeVideo');
            let ctx = this.state.imgCanvas.getContext('2d');
            this.state.imgCanvas.style.width = this.state.imgCanvas.width + 1000;
            this.state.imgCanvas.style.height = this.state.imgCanvas.height + 1000;
            ctx.drawImage(v, 0, 0, this.state.imgCanvas.width, this.state.imgCanvas.height);

            document.getElementById('imgCanvas').style.transform = 'scale(2,2)';
            html2canvas(this.state.imgCanvas, {
                logging: true,
                profile: true,
                useCORS: true }).then(function(canvas) {
                // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                ctx.drawImage(v, 0, 0, 300, 150);
                $.ajax({
                    url: "https://cmi.fast.sheridanc.on.ca:8080/uploadPhoto",
                    type: 'POST',
                    data: {
                        image: a.href,
                        cID: cID
                    },
                    dataType: 'text',
                    method: 'POST',
                    success: function(response) {
                        console.log("success");
                    },
                    error: function(jqXHR, textStatus, errorMessage) {
                        console.log(errorMessage); // Optional
                    }
                });

                let cID = this.state.conferenceID.toString();
                a.download = cID + f + '.jpg';
                a.click();
                document.getElementById('imgCanvas').style.transform = 'scale(1,1)';


            });
        }
    }

    // todo will process chart of current patient with ERM/CRM
    handleClick() {
        alert('Here is the patient chart');
    }

    // handles room change to next patient
    handleRoomChange() {
        const response = confirm('You are about to join another room. Press Ok to accept');
        if (response === true) {
            txt = 'You are moving to the next room';
            location.reload();
        }
    }

    // records the call from the start
    // todo set up send to server when recording is finished
    // todo set up when doctor ends call, the recording will be sent to server

    recordSnip() {
        // checks to see if recording is started
        let stream;
        let cID = this.state.urlParams.conferenceId;
        console.log(cID);
        let video = document.getElementById('largeVideo');
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            // Do Firefox-related activities
            stream = this.state.imgCanvas.captureStream();
            console.log('firefox');
        } else if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            stream = video.captureStream();
            console.log('chrome');
        }
        console.log('------------------ Recording Snippet ------------------------');
        let mediaRecorder = new MediaStreamRecorder(stream);
        //this.state.snippetRecorder = mediaRecorder;
        mediaRecorder.mediaConstraints = this.state.mediaConstraints;
        // type of video being recorded
        mediaRecorder.mimeType = 'video/mp4';
        mediaRecorder.start(11000);

        console.log('recording for 10 seconds');

        var number = 0;
        mediaRecorder.ondataavailable = function(blob) {
            if (number === 0){
                number = 1;

                blobToBase64(blob, function(error, base64) {
                    if (!error) {
                        $.ajax({
                            url: "https://cmi.fast.sheridanc.on.ca:8080/uploadSnippet",
                            type: 'POST',
                            data: {
                               snippet: base64,
                               cID: cID
                            },

                            method: 'POST',
                            dateType: 'text',
                            success: function(response) {
                                console.log("success");
                            },
                            error: function(jqXHR, textStatus, errorMessage) {
                                console.log(errorMessage); // Optional
                            }
                        });
                        console.log('------------------ Video sent to Database ------------------------');
                    }
                });
            } else {
                mediaRecorder.stop();
                mediaRecorder.manuallyStopped;
            }
        };
    }

    recordCall() {
        // checks to see if recording is started
        if (this.state.recording === false){
            console.log("is false");
            this.state.recording = true;
        }
        else if(this.state.recording === true){
            console.log("is true");
            return;
        }

        let stream;
        let cID = this.state.urlParams.conferenceId;
        let video = document.getElementById('largeVideo');
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            // Do Firefox-related activities
            stream = this.state.imgCanvas.captureStream();
            console.log('firefox');
        } else if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            stream = video.captureStream();
            console.log('chrome');
        }
        console.log('------------------ Recording Call ------------------------');
        let mediaRecorder = new MediaStreamRecorder(stream);
        //this.state.snippetRecorder = mediaRecorder;
        mediaRecorder.mediaConstraints = {
            audio: true,
            video: false
        };
        // type of video being recorded
        mediaRecorder.mimeType = 'video/mp4';
        mediaRecorder.start(61000);

        console.log('recording for 10 seconds');

        var number = 0;
        mediaRecorder.ondataavailable = function(blob) {

            if (number === 0){
                var videoFile;

                blobToBase64(blob, function(error, base64) {
                    if (!error) {
                        $.ajax({
                            url: "https://cmi.fast.sheridanc.on.ca:8080/uploadVideo",
                            type: 'POST',
                            data: {
                                snippet: base64,
                                cID: cID
                            },

                            method: 'POST',
                            dateType: 'text',
                            success: function(response) {
                                console.log("success");
                            },
                            error: function(jqXHR, textStatus, errorMessage) {
                                console.log(errorMessage); // Optional
                            }
                        });
                        console.log('------------------ Video sent to Database ------------------------');

                    }
                });


                number = 1;

                console.log('------------------ Video sent to Database ------------------------');
            } else {
                mediaRecorder.stop();
                mediaRecorder.manuallyStopped;
            }
        };

    }

    // todo send information to selected place
    // checks to see if doctor is done with patient
    onFinishWithPatient() {
        const response = confirm('Are you sure you are done with this patient. Press Ok to accept');
        if (response === true) {
            this.state.finishedWithPatient = true;
        }
        if (this.state.finishedWithPatient === true) {
            let cID = this.state.conferenceID.toString();
            var xml = builder.create(cID)
                .ele('Media')
                    .ele('Photos', {'type': 'jpeg'}, '/usr/share/pictures/' + cID).up()
                    .ele('Video', {'type': 'mp4'}, '/usr/share/videos/' + cID ).up()
                    .ele('Snippet', {'type': 'mp4'}, '/usr/share/snippets/' + cID).up()
                .end({ pretty: true});

            //console.log(xml);


            $(document).ready(function(){

                var confID = cID;
                var file=(xml).replace(new RegExp('\"', 'g'), '\\\"');//enter logic for ur xml file
                console.log(file);
                var url = "https://pcsservices.ca/ConferenceWebService/api/conference/"+confID;
                console.log(url);
                console.log(file);

                $.ajax({
                    url:url,
                    contentType:'application/json',
                    dataType:'json',
                    data: '"'+file+'"',
                    type:'POST',
                    xhrFields: {
                        withCredentials: false
                    },
                    success:function(data, textStatus, jQxhr){
                    },
                    error:function(xhr, textStatus, errorThrown){
                        console.log("Error saving conference file: "+errorThrown);
                        alert("Error saving conference file: "+errorThrown);
                    }
                });
            });

            document.getElementById('changeRoom').style.visibility = 'visible';
            document.getElementById('finishButton').style.visibility = 'hidden';
            //document.getElementById('finishForm').style.visibility = 'hidden';
            //document.getElementById('finishLabel').innerText = 'Select your next patient';
            alert('Information sent, when youre ready select next patient');
            this.recordCall();

        } else {
            console.log('cancelled');


        }
    }

    // checks for a media error
    onMediaError(e) {
        console.error('media error', e);
    }

    // will zoom in the main video up 5x and will reset it after the 4th click
    zoomWebcam() {
        if (this.state.zoom === false) {
            if (this.state.zoomStrength === 1) {
                this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(2,2)';
                this.state.zoomStrength = 2;
            } else if (this.state.zoomStrength === 2) {
                this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(3,3)';
                this.state.zoomStrength = 3;
            } else if (this.state.zoomStrength === 3) {
                this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(4,4)';
                this.state.zoom = true;
                this.state.zoomStrength = 1;
            }
        } else if (this.state.zoom === true) {
            this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(1,1)';
            this.state.zoom = false;
        }
    }

    // Open the web page of m-health
    mHealth() {
        let win = window.open('https://m-healthsolutions.com', '_blank');
        win.focus();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        // css elements
        let mediaButtons = {
            width: '100%',
            padding: 3.5
        };
        let patientChart = {
            padding: 10
        };
        let checkBoxes = {
            padding: 3
        };
        let text = {
            color: 'ffffff'
        };
        let overflow = {
            overflow: 'auto'
        };

        if (this.state.urlParams.patient === 'false') {

            return (

                // doctor view
                <div
                    type='text/javascript' src='scripts/buttonClick.js'
                    className='videocontainer'
                    id='largeVideoContainer'>
                    <div id='doctorNotes'>
                        <h3 style= { text } >Reminders for Patient:</h3>
                        <br></br>
                        <div>
                            <p>{this.state.reminders}</p>
                            <input id="checkBox" type="checkbox"></input>
                        </div>
                        <br></br>
                        <h3 style = { text }>First/Last Name:</h3>
                        <p id='fName'>{this.state.names[0]}</p>
                        {this.state.pictures[0]}
                        <h3 style = { text } >Chief Complaint:</h3>
                        <p id='chiefComplaint'>{this.state.chiefcomplaint}</p>
                        <h3 style= { text } >Date:</h3>
                        <p id ='today'>{this.state.date}</p>
                        <h3 style= { text } >Patient ID:</h3>
                        <p id ='patientID'>{this.state.patientID[0]}</p>
                        <h3 style= { text } >Conference ID:</h3>
                        <p id ='allergies'>{this.state.conferenceID}</p>
                        <h3 style= { text } >Patient Chart:</h3>
                        <button style = { patientChart } type='button' value='clickme' onClick= { this.handleClick } >{this.state.names[0]}'s Chart
                        </button>
                        <h3 style= { text } >Quick Notes:</h3>
                        <form onSubmit = { this.handleSubmit }>
                            <textarea style = { overflow } rows="4" cols="35" id="doctorCallNotes"></textarea>
                        </form>

                        <br></br>
                        <br></br>
                        <button style= { patientChart } id = 'finishButton' onClick={this.onFinishWithPatient}> Click me when youre finished with the patient </button>
                    </div>
                    <div>
                        <ul  ref='reminder' id='reminder'>
                            <br></br>
                            <img
                                onClick ={ this.mHealth }
                                src ='https://m-healthsolutions.com/wp-content/uploads/2018/05/m-health-solutions_logo_Transparent.png'
                                id ='pictureDoctor'>
                            </img>
                            <br></br>
                            <br></br>
                            <p style= { text } >Click Main Video to Zoom in</p>
                            <p style= { text } >Click Video below to take a Photo</p>
                            <canvas id = 'imgCanvas' onClick= { this.takenPicture }> </canvas>
                            <br></br>
                            <br></br>
                            <button style= { mediaButtons } onClick= { this.recordSnip }>10 seconds snippet</button>
                            <button style= { mediaButtons } onClick= { this.recordCall }>Stop Recording</button>
                            <br></br>
                            <form ref='uploadForm'
                                  id='uploadForm'
                                  action='https://cmi.fast.sheridanc.on.ca:8080/upload'

                                  method='post'
                                  encType="multipart/form-data">
                                <input type="file" name="sampleFile" />
                                <input type='submit' value='Upload!' />
                            </form>
                        </ul>
                    </div>
                    <div>
                        <ul id='waitingRoom' align='center'>
                            <h2 style= { text } >Waiting Room</h2>
                            <br></br>
                            {this.state.button}
                        </ul>
                    </div>
                    <div id='sharedVideo'>
                        <div id='sharedVideoIFrame' />
                    </div>
                    <div id='etherpad' />
                    <div id='dominantSpeaker'>
                        <div className='dynamic-shadow' />
                        <img
                            id='dominantSpeakerAvatar'
                            src='' />
                    </div>
                    <div id='remotePresenceMessage' />
                    <span id='remoteConnectionMessage' />
                    <div>
                        <div id='largeVideoBackgroundContainer' />
                        {

                            /**
                             * FIXME: the architecture of elements related to the
                             * large video and  the naming. The background is not
                             * part of largeVideoWrapper because we are controlling
                             * the size of the video through largeVideoWrapper.
                             * That's why we need another container for the the
                             * background and the largeVideoWrapper in order to
                             * hide/show them.
                             */
                        }
                        <div id='largeVideoWrapper'>
                            <video
                                ref = 'largeVideo'
                                autoPlay = { true }
                                id ='largeVideo'
                                muted ={ false }
                                onClick = { this.zoomWebcam} />

                        </div>
                    </div>
                    <span id='localConnectionMessage' />
                    {this.props.hideVideoQualityLabel
                        ? null : <VideoQualityLabel /> }
                    <RecordingLabel />
                </div>
            );
        } else if (this.state.urlParams.patient === 'true') {

            // Patient View
            return (
                <div
                    type='text/javascript' src='scripts/buttonClick.js'
                    className='videocontainer'
                    id='largeVideoContainer'>
                    <div id='patientNotes'>
                        <br></br>
                        <img
                            onClick={ this.mHealth }
                            src='https://m-healthsolutions.com/wp-content/uploads/2018/05/m-health-solutions_logo_Transparent.png'
                            id='pictureDoctor'>
                        </img>
                        <p>Click on logo to go to our site</p>
                        <br></br>
                        <h2>First/Last Name:</h2>
                        <br></br>
                        <p id='fName'>{this.state.nameP}</p>
                        {this.state.pictures[0]}
                        <h4>Date:</h4>
                        <br></br>
                        <p id='today'>{this.state.date}</p>
                        <h2>Conference ID:</h2>
                        <p id='patientID'>{this.state.conferenceID}</p>
                        <br></br>
                        <br></br>
                        <p>This session is one time only, meaning the link will not work</p>
                        <p>after this call.</p>
                        <p>&copy; m-Health Solutions 2018</p>
                    </div>
                    <div id='sharedVideo'>
                        <div id='sharedVideoIFrame' />
                    </div>
                    <div id='etherpad'/>
                    <div id='remotePresenceMessage'/>
                    <span id='remoteConnectionMessage'/>
                    <div>
                        <div id='largeVideoBackgroundContainer'/>
                        {

                            /**
                             * FIXME: the architecture of elements related to the
                             * large video and  the naming. The background is not
                             * part of largeVideoWrapper because we are controlling
                             * the size of the video through largeVideoWrapper.
                             * That's why we need another container for the the
                             * background and the largeVideoWrapper in order to
                             * hide/show them.
                             */
                        }
                        <div id='largeVideoWrapper'>
                            <video
                                ref = 'largeVideo'
                                autoPlay= { true }
                                id = 'largeVideo'
                                muted= { false }
                                onClick= { this.zoomWebcam } />
                        </div>
                    </div>
                    <span id='localConnectionMessage' />
                    {this.props.hideVideoQualityLabel
                        ? null : <VideoQualityLabel />}
                    <RecordingLabel />
                </div>
            );
        } else {

            // if patient parameter was not found
            return (
                <div
                    type='text/javascript' src='scripts/buttonClick.js'
                    className='videocontainer'
                    id='largeVideoContainer'>
                    <div id='patientNotes' >
                        <br></br>
                        <img
                            onClick={ this.mHealth }
                            src='https://m-healthsolutions.com/wp-content/uploads/2018/05/m-health-solutions_logo_Transparent.png'
                            id='pictureDoctor'>
                        </img>
                        <p>Click on logo to go to our site</p>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <h1>Please schedule <br></br>  an appointment with <br></br> your doctor</h1>
                        <p>&copy; m-Health Solutions 2018</p>
                    </div>
                    <div id='sharedVideo'>
                        <div id='sharedVideoIFrame' />
                    </div>
                    <div id='etherpad' />
                    <div id='remotePresenceMessage' />
                    <span id='remoteConnectionMessage' />
                    <div>
                        <div id='largeVideoBackgroundContainer' />
                        {
                            /**
                             * FIXME: the architecture of elements related to the
                             * large video and  the naming. The background is not
                             * part of largeVideoWrapper because we are controlling
                             * the size of the video through largeVideoWrapper.
                             * That's why we need another container for the the
                             * background and the largeVideoWrapper in order to
                             * hide/show them.
                             */
                        }
                        <div id='largeVideoWrapper'>
                            <video
                                ref='largeVideo'
                                autoPlay = { true }
                                id = 'largeVideo'
                                muted= { false }
                                onClick= { this.zoomWebcam } />
                        </div>
                    </div>
                    <span id='localConnectionMessage' />
                    {this.props.hideVideoQualityLabel
                        ? null : <VideoQualityLabel /> }
                    <RecordingLabel />
                </div>
            );
        }
    }
}
