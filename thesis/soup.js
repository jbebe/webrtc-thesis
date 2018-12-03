const room = new mediasoupClient.Room();

room.join(username)
    .then(handlePeersAlreadyInRoom)
    .then(getUserMedia)
    .then(addOwnStreamToRoom);

channel.on('message', handleNewMessage);

app.UseSignalR(routes =>
{
    routes.MapHub<SignalServerHub>("/chat");
});

this.signalingService.subscribe.OnUserConnected = this.addNewUser;
this.signalingService.subscribe.OnUserDisconnected = this.removeUser;

@RemoteAction()
public async RequestSdpExchangeAsync(guestId: string, hostSdpHeader: RTCSessionDescriptionInit) {}

Event->WebRtcService: loadRoomAsync(user.id)
WebRtcService->WebRtcService: unload current room
WebRtcService->Room: new WebRtcChatRoom(user.id)
Room-->WebRtcService: 
WebRtcService->Room: room.initHostAsync(channelName)
Room->WebRTCHost: new WebRTCHost()
WebRTCHost-->Room: 
Room->WebRTCHost: connectAsync()
WebRTCHost-->(1)Room: sendOfferToRemoteAsync()
Room->SignalingService: RequestSdpExchangeAsync()
SignalingService-->(1)WebRTCHost: onReceiveOfferFromRemote()
WebRTCHost->WebRTCHost: wait for all data channels to be ready
WebRTCHost->Room: Connected successfully