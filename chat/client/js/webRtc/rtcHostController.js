import { RtcControllerBase } from "./rtcControllerBase.js";
import { trace } from "../utils.js";

'use strict';

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
      .then(() =>{
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