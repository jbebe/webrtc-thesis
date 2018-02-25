import { RtcControllerBase } from "./rtcControllerBase.js";
import { trace } from "../utils.js";

'use strict';

export class RtcClientController extends RtcControllerBase {
  
  //
  // public
  //
  
  constructor(options){
    super(options);
  }
  
  init(){
    this.initMedia().catch(trace);
    // init datachannel
    this.connection.ondatachannel = this.onDataChannel.bind(this);
  }
  
  acceptOffer(remoteDescription){
    this.connection.setRemoteDescription(remoteDescription).then(async () =>{
      const localDescription = await this.connection.createAnswer();
      this.connection.setLocalDescription(localDescription).catch(trace);
    });
  }
  
  //
  // private
  //
  
  onDataChannel(event){
    this.dataChannel = event.channel || event;
    this.dataChannel.onopen = RtcControllerBase.onDataChannelOpen;
    this.dataChannel.onmessage = this.onDataChannelMessage.bind(this);
    trace('DataChannel received');
  }
  
}