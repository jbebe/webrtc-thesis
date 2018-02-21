import { RtcControllerBase } from "./rtcControllerBase.js";
import { trace } from "../utils.js";

'use strict';

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
    this.dataChannel.onmessage = event =>{
      console.log(event.data);
      if (event.data.toString().includes('ArrayBuffer') || event.data === 'EOF'){
        // receive file
        this.onReceiveFile(event);
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