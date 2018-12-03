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