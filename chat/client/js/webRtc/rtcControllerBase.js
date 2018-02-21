import { trace } from "../utils.js";

'use strict';

export class RtcControllerBase {
  
  static get RtcConfig(){
    return { 'iceServers': [] };
  };
  
  constructor(options){
    this.connection = new RTCPeerConnection(this.RtcConfig);
    this.dataChannel = null;
    this.receivingMediaElement = options.receivingMediaElement;
    this.connection.onaddstream = this.onAddStream;
    this.onMessage = options.onMessage;
    this.localDescription = null;
    
    this.connection.onicecandidate = this.onIceCandidate.bind(this);
    this.connection.onsignalingstatechange = trace;
    this.connection.oniceconnectionstatechange = trace;
    this.connection.onicegatheringstatechange = trace;
    this.connection.onaddstream = this.onAddStream.bind(this);
    this.connection.onconnection = trace;
    
    // file related
    this.receiveBuffer = [];
    this.receivedSize = 0;
    this.onFileUploaded = options.onFileUploaded;
  }
  
  send(data){
    this.dataChannel.send(JSON.stringify(data));
  }
  
  static onDataChannelOpen(event){
    trace(event);
  }
  
  static onDataChannelMessage(event){
    trace(event);
  }
  
  onIceCandidate(event){
    if (event.candidate === null){
      this.localDescription = this.connection.localDescription;
      trace(JSON.stringify(this.localDescription));
    }
  }
  
  async getLocalDescription(){
    return new Promise(resolve =>{
      setInterval(() =>{
        if (this.localDescription !== null){
          resolve(this.localDescription);
        }
      }, 1000/*ms*/);
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
  
}