import { trace } from "./utils.js";

'use strict';

class RtcControllerBase {
  
  static get RtcConfig(){
    return {'iceServers': []};
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
    return new Promise(resolve => {
      setInterval(() => {
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
    
    super(options);
    this.options = options;
  }
  
  async init(){
    // media stream
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then(stream =>{
        // show media on screen
        trace(this.options);
        this.options.streamingMediaElement.autoplay = true;
        this.options.streamingMediaElement.srcObject = stream;
        this.options.streamingMediaElement.play().catch(trace);
        this.connection.addStream(stream);
        trace('#1 stream added to connection');
      })
      .then(() =>{
        // init datachannel
        this.initDataChannel();
        trace('#2 data channel initialized');
      })
      .then(() => {
        // set local description
        this.connection.createOffer({
            optional: [],
            mandatory: {
              OfferToReceiveAudio: false,
              OfferToReceiveVideo: true
            }
          })
          .then(async sdpHeader =>{
            this.connection.setLocalDescription(sdpHeader).catch(trace);
            trace('#3 local description set');
          })
          .catch(trace);
      });
  }
  
  addRemoteDescription(sdpHeader){
    this.connection.setRemoteDescription(sdpHeader).catch(trace);
  }
  
  //
  // private
  //
  
  initDataChannel(){
    this.dataChannel = this.connection.createDataChannel('data-channel-name', { reliable: true });
    this.dataChannel.onopen = trace;
    this.dataChannel.onmessage = event =>{
      trace(`dataChannel message: ${event.data}`);
      if (event.data.size){
        // receive file
      } else {
        const data = JSON.parse(event.data);
        if (data.type === 'file'){
          // receive file
        } else {
          // update chat board
          this.onMessage(event.data);
        }
      }
    };
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
    
    super(options);
    this.options = options;
  }
  
  init(){
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then(stream =>{
        // show media on screen
        trace(this.options);
        this.options.streamingMediaElement.autoplay = true;
        this.options.streamingMediaElement.srcObject = stream;
        this.options.streamingMediaElement.play();
        this.connection.addStream(stream);
      })
      .catch(error =>{
        trace(error);
      });
    this.connection.ondatachannel = this.onDataChannel.bind(this);
  }
  
  acceptOffer(remoteDescription){
    this.connection.setRemoteDescription(remoteDescription).then(async () =>{
      const localDescription = await this.connection.createAnswer({
        optional: [],
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        }
      });
      this.connection.setLocalDescription(localDescription).catch(trace);
    });
  }
  
  //
  // private
  //
  
  onDataChannel(event){
    this.dataChannel = event.channel || event;
    trace('received dataChannel');
    this.dataChannel.onopen = event =>{
      trace('data channel connect')
    };
    this.dataChannel.onmessage = event => {
      trace('message: ' + event.data);
      if (event.data.size){
        // receive file
      } else {
        const data = JSON.parse(event.data);
        if (data.type === 'file'){
          // receive file
        } else {
          this.onMessage(event.data);
        }
      }
    }
  }
  
}