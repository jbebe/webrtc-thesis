import { trace } from "../utils.js";

'use strict';

export class RtcControllerBase {
  
  static get RtcConfig(){
    return {
      'iceServers': [
          { url:'stun:stun.ekiga.net' }
        ]
    };
  };
  
  constructor(options){
    this.dataChannel = null;
    this.receivingMediaElement = options.receivingMediaElement;
    this.streamingMediaElement = options.streamingMediaElement;

    this.onMessage = options.onMessage;
    this.localDescription = null;
  
    this.connection = new RTCPeerConnection(RtcControllerBase.RtcConfig);
    this.connection.onaddstream = this.onAddStream;
    this.connection.onicecandidate = this.onIceCandidate.bind(this);
    this.connection.onsignalingstatechange = RtcControllerBase.onConnectionAndSignalingAndGatheringStateChange;
    this.connection.oniceconnectionstatechange = RtcControllerBase.onConnectionAndSignalingAndGatheringStateChange;
    this.connection.onicegatheringstatechange = RtcControllerBase.onConnectionAndSignalingAndGatheringStateChange;
    this.connection.onaddstream = this.onAddStream.bind(this);
    this.connection.onconnection = trace;
    
    // file related
    this.receiveBuffer = [];
    this.receivedSize = 0;
    this.onFileUploaded = options.onFileUploaded;
    
    // media
    this.mediaConfig = options.mediaConfig;
  }
  
  async initMedia(){
    return new Promise((resolve, reject) => {
      if (this.mediaConfig){
        navigator.mediaDevices.getUserMedia(this.mediaConfig)
          .then(stream =>{
            this.streamingMediaElement.autoplay = true;
            this.streamingMediaElement.srcObject = stream;
            this.streamingMediaElement.play().catch(trace);
            this.connection.addStream(stream);
            resolve();
          })
          .catch(reject);
      } else {
        resolve();
      }
    });
  }
  
  send(data){
    this.dataChannel.send(JSON.stringify(data));
  }
  
  static onDataChannelOpen(event){
    trace(
      `DataChannel ${event.target.label}(${event.target.id}): ` +
      `state: ${event.target.readyState}, type: ${event.target.binaryType}`
    );
  }
  
  onDataChannelMessage(event){
    trace(event.data);
    if (event.data.toString().includes('ArrayBuffer') || event.data === 'EOF'){
      // receive file
      this.onReceiveFile(event);
    } else {
      const data = JSON.parse(event.data);
      if (data.type === 'file'){
        // receive file
      } else {
        this.onMessage(data.message);
      }
    }
  }
  
  onIceCandidate(event){
    if (event.candidate === null){
      trace('ICE candidate discovery finished');
      trace('Filled local description is ready');
      this.localDescription = this.connection.localDescription;
    } else {
      trace(`New ICE candidate: ${event.candidate.ip}/${event.candidate.protocol}`);
    }
  }
  
  async getLocalDescription(){
    return new Promise(resolve =>{
      const intervalId = setInterval(() =>{
        if (this.localDescription !== null){
          clearInterval(intervalId);
          resolve(this.localDescription);
        }
      }, 500/*ms*/);
    });
  }
  
  onAddStream(event){
    trace('got remote stream' + event.stream);
    if (this.receivingMediaElement.srcObject === null){
      this.receivingMediaElement.autoplay = true;
      this.receivingMediaElement.srcObject = event.stream;
      
    } else {
      trace('media object is already streaming!');
    }
  }
  
  close(){
    trace('connection closed');
    this.connection.close();
  }
  
  sendFile(file){
    trace('File is ' + [file.name, file.size, file.type,
      file.lastModifiedDate
    ].join(' '));
    
    // Handle 0 size files.
    if (file.size === 0){
      trace('File is empty, please select a non-empty file');
      return;
    }
    trace(`max filesize: ${file.size}`);
    const chunkSize = 16384;
    const sliceFileFrom = (offset) =>{
      const reader = new FileReader();
      reader.onload = event =>{
        this.dataChannel.send(event.target.result);
        if (file.size > offset + event.target.result.byteLength){
          setTimeout(sliceFileFrom, 0, offset + chunkSize);
        } else {
          this.dataChannel.send('EOF');
        }
        trace(`progress: ${offset + event.target.result.byteLength}`);
      };
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    sliceFileFrom(0);
  }
  
  onReceiveFile(event){
    this.receiveBuffer.push(event.data);
    trace(`received size: ${event.data.byteLength}`);
    this.receivedSize += event.data.byteLength ? event.data.byteLength : 0;
    trace(`receive progress: ${this.receivedSize}`);
    
    // we are assuming that our signaling protocol told
    // about the expected file size (and name, hash, etc).
    if (event.data === 'EOF'){
      this.receiveBuffer.pop();
      const received = new Blob(this.receiveBuffer, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      this.receiveBuffer = [];
      
      this.onFileUploaded({
        url: URL.createObjectURL(received),
        filename: 'filename.docx',
        bytes: this.receivedSize
      });
  
      this.receivedSize = 0;
    }
  }
  
  static onConnectionAndSignalingAndGatheringStateChange(event){
    trace('ICE State: ' +
      `signaling: ${event.target.signalingState}, ` +
      `connection: ${event.target.iceConnectionState}, ` +
      `gathering: ${event.target.iceGatheringState}`
    );
  }
  
}