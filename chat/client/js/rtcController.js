import { trace } from "./utils.js";

'use strict';

class RtcControllerBase {
  
  constructor(receivingMediaElement){
    this.connection = new RTCPeerConnection();
    this.dataChannel = this.connection.createDataChannel('data-channel-name', { reliable: true });
    this.receivingMediaElement = receivingMediaElement;
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
  
  static onIceCandidate(event){
    trace(event);
  }
  
  onAddStream(event){
    trace('got remote stream', event.stream);
    if (this.receivingMediaElement.srcObject === undefined){
      trace('media object is already streaming!');
    } else {
      this.receivingMediaElement.autoplay = true;
      this.receivingMediaElement.srcObject = event.stream;
    }
  }
  
  close(){
    trace('connection closed');
    this.connection.close();
  }
  
}

export class RtcHostController extends RtcControllerBase {
  
  //
  // public
  //
  
  constructor(options){
    /*options = {
      streamingMediaElement: HTMLElement,
      receivingMediaElement: HTMLElement
    };*/
    
    super(options.receivingMediaElement);
    this.options = options;
  }
  
  async init(){
    return Promise.all([
      // media stream
      new Promise(resolve =>{
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
          .then(stream => {
            // show media on screen
            trace(this.options);
            this.options.streamingMediaElement.autoplay = true;
            this.options.streamingMediaElement.srcObject = stream;
            this.options.streamingMediaElement.play();
            this.connection.addStream(stream);
            resolve(true);
          })
          .catch(error =>{
            trace(error);
            resolve(false);
          });
      }),
      this.initDataChannel(),
      // init description
      new Promise(resolve =>{
        // set local description
        this.connection.createOffer()
          .then(async sdpHeader =>{
            this.connection.setLocalDescription(sdpHeader).then(resolve);
          })
          .catch(trace);
        
        this.connection.onicecandidate = event =>{
          if (event.candidate === null){
            trace(JSON.stringify(this.connection.localDescription));
          }
        };
        
        this.connection.onaddstream = this.onAddStream;
        this.connection.onsignalingstatechange = trace;
        this.connection.oniceconnectionstatechange = trace;
        this.connection.onicegatheringstatechange = trace;
      })
    ]);
  }
  
  getDescription(){
    return this.connection.localDescription;
  }
  
  addRemoteDescription(sdpHeader){
    this.connection.setRemoteDescription(sdpHeader).catch(trace);
  }
  
  //
  // private
  //
  
  initDataChannel(){
    this.dataChannel.onopen = trace;
    this.dataChannel.onmessage = event =>{
      trace(`dataChannel message: ${e.data}`);
      if (e.data.size){
        // receive file
      } else {
        console.log(e);
        const data = JSON.parse(e.data);
        if (data.type === 'file'){
          // receive file
        } else {
          // update chat board
        }
      }
    }
  }
  
}

export class RtcClientController extends RtcControllerBase {
  
  //
  // public
  //
  
  constructor(options){
    /*options = {
      streamingMediaElement: HTMLElement,
      receivingMediaElement: HTMLElement
    };*/
    
    super(options.receivingMediaElement);
    this.options = options;
  }
  
  init(){
    this.connection.ondatachannel = this.onDataChannel;
    this.connection.onicecandidate = trace;
    this.connection.onsignalingstatechange = trace;
    this.connection.oniceconnectionstatechange = trace;
    this.connection.onicegatheringstatechange = trace;
    this.connection.onaddstream = trace;
    this.connection.onconnection = trace;
  }
  
  async acceptOffer(remoteDescription){
    return new Promise(resolve =>{
      this.connection.setRemoteDescription(remoteDescription).then(async () =>{
        const localDescription = await this.connection.createAnswer();
        this.connection.setLocalDescription(localDescription)
          .then(() => resolve(localDescription));
      });
    });
  }
  
  getDescription(){
    return this.connection.localDescription;
  }
  
  //
  // private
  //
  
  onDataChannel(event){
    const dataChannel = event.channel || event;
    console.log('received dataChannel', arguments);
    dataChannel.onopen = event =>{
      console.log('data channel connect')
    };
    dataChannel.onmessage = function(e){
      console.log('message: ', e.data);
      if (e.data.size){
        // receive file
      } else {
        const data = JSON.parse(e.data);
        if (data.type === 'file'){
          // receive file
        } else {
          trace(data);
        }
      }
    }
  }
  
}