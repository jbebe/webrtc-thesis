import { trace } from "/js/Utils.js";
'use strict';

export class DataStreamController {
  
  constructor(servers = null){
    this.localConnection = null;
    this.remoteConnection = null;
    this.sendChannel = null;
    this.receiveChannel = null;
    this.localDescription = null;
    this.remoteDescription = null;
    
    this.initConnection(servers)
  }
  
  sendData(data){
    this.sendChannel.send(data);
    trace('Sent Data: ' + data)
  }
  
  initConnection(servers){
    trace('Using SCTP based data channels');
    // SCTP is supported from Chrome 31 and is supported in FF.
    // No need to pass DTLS constraint as it is on by default in Chrome 31.
    // For SCTP, reliable and ordered is true by default.
    // Add localConnection to global scope to make it visible
    // from the browser console.
    this.localConnection = new RTCPeerConnection(servers);
    trace('Created local peer connection object localConnection');
    
    const channelOptions = null;
    this.sendChannel = this.localConnection.createDataChannel('sendDataChannel', channelOptions);
    trace('Created send data channel');
    
    this.localConnection.onicecandidate = (event) => {
      this.onIceCandidate(this.localConnection, event)
    };
    this.sendChannel.onopen = this.onSendChannelStateChange.bind(this);
    this.sendChannel.onclose = this.onSendChannelStateChange.bind(this);
    
    // Add remoteConnection to global scope to make it visible
    // from the browser console.
    this.remoteConnection = new RTCPeerConnection(servers);
    trace('Created remote peer connection object remoteConnection');
    
    this.remoteConnection.onicecandidate = (event) => {
      this.onIceCandidate(this.remoteConnection, event)
    };
    this.remoteConnection.ondatachannel = this.receiveChannelCallback;
    
    this.localConnection.createOffer().then(
      (desc) => this.gotDescription1(desc),
      (error) => this.onCreateSessionDescriptionError(error)
    )
  }
  
  receiveChannelCallback(event) {
    trace('Receive Channel Callback');
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = this.onReceiveMessageCallback;
    this.receiveChannel.onopen = this.onReceiveChannelStateChange;
    this.receiveChannel.onclose = this.onReceiveChannelStateChange
  }
  
  onReceiveChannelStateChange() {
    const readyState = this.receiveChannel.readyState;
    trace('Receive channel state is: ' + readyState)
  }
  
  gotDescription1(desc) {
    this.localDescription = desc;
    console.log(desc);
    this.localConnection.setLocalDescription(desc);
    trace('Offer from localConnection \n' + desc.sdp.split('\n').map(t => `\t${t}`).join('\n'));
    this.remoteConnection.setRemoteDescription(desc);
    this.remoteConnection.createAnswer().then(
      (desc) => this.gotDescription2(desc),
      (error) => this.onCreateSessionDescriptionError(error)
    )
  }
  
  gotDescription2(desc) {
    this.remoteConnection.setLocalDescription(desc);
    trace('Answer from remoteConnection \n' + desc.sdp.split('\n').map(t => `\t${t}`).join('\n'));
    this.localConnection.setRemoteDescription(desc)
  }
  
  getOtherPc(pc) {
    return (pc === this.localConnection) ? this.remoteConnection : this.localConnection
  }
  
  getName(pc) {
    return (pc === this.localConnection) ? 'localPeerConnection' : 'remotePeerConnection'
  }
  
  static onReceiveMessageCallback(event) {
    trace(`Received Message: ${event.data}`)
  }
  
  onSendChannelStateChange() {
    let readyState = this.sendChannel.readyState;
    trace('Send channel state is: ' + readyState);
    if (readyState === 'open') {
    
    }
  }
  
  static onCreateSessionDescriptionError(error) {
    trace('Failed to create session description: ' + error.toString())
  }
  
  onIceCandidate(pc, event) {
    this.getOtherPc(pc).addIceCandidate(event.candidate)
    .then(
      () => {
        DataStreamController.onAddIceCandidateSuccess(pc)
      },
      (err) => {
        DataStreamController.onAddIceCandidateError(pc, err)
      }
    );
    trace(this.getName(pc) + ' ICE candidate: \n' + (event.candidate ?
      event.candidate.candidate : '(null)'))
  }
  
  static onAddIceCandidateSuccess(){
    trace('AddIceCandidate success.')
  }
  
  static onAddIceCandidateError(error) {
    trace('Failed to add Ice Candidate: ' + error.toString())
  }
  
  closeDataChannels() {
    trace('Closing data channels');
    this.sendChannel.close();
    trace('Closed data channel with label: ' + this.sendChannel.label);
    this.receiveChannel.close();
    trace('Closed data channel with label: ' + this.receiveChannel.label);
    this.localConnection.close();
    this.remoteConnection.close();
    this.localConnection = null;
    this.remoteConnection = null;
    trace('Closed peer connections')
  }
  
}