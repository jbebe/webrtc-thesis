import { RtcControllerBase } from "./rtcControllerBase.js";
import { trace } from "../utils.js";

'use strict';

export class RtcHostController extends RtcControllerBase {
  
  //
  // public
  //
  
  constructor(options){
    super(options);
    this.streamingMediaElement = options.streamingMediaElement;
  }
  
  async init(){
    return new Promise((resolve, reject) => {
      this.initMedia()
        .then(() =>{
          // init datachannel
          this.initDataChannel();
        })
        .then(() =>{
          // set local description
          this.connection.createOffer()
            .then(async sdpHeader =>{
              this.connection.setLocalDescription(sdpHeader).then(() => {
                trace('Unfilled local description set');
                resolve();
              }).catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
  
  addRemoteDescription(sdpObject){
    this.connection.setRemoteDescription(sdpObject).catch(trace);
  }
  
  //
  // private
  //
  
  initDataChannel(){
    this.dataChannel = this.connection.createDataChannel('data-channel-name');
    this.dataChannel.onopen = RtcHostController.onDataChannelOpen;
    this.dataChannel.onmessage = this.onDataChannelMessage.bind(this);
    trace('Data channel initialized');
  }
  
}