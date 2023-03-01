import AgoraRTC from "agora-rtc-sdk-ng"



let options =
{
    // Pass your App ID here.
    appId: '',
    // Set the channel name.
    channel: 'agora',
    // Pass your temp token here.
    token: '',
    // Set the user ID.
    uid: 0,
};

let channelParameters =
{
    // A variable to hold a local audio track.
    localAudioTrack: null,
    // A variable to hold a local video track.
    localVideoTrack: null,
    // A variable to hold a remote audio track.
    remoteAudioTrack: null,
    // A variable to hold a remote video track.
    remoteVideoTrack: null,
    // A variable to hold the remote user id.s
    remoteUid: null,
};
async function startBasicCall()
{


// Create an instance of the Agora Engine
const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Dynamically create a container in the form of a DIV element to play the remote video track.
const remotePlayerContainer = document.createElement("div");

// Dynamically create a container in the form of a DIV element to play the local video track.
const localPlayerContainer = document.createElement('div');

// Specify the ID of the DIV container. You can use the uid of the local user.
localPlayerContainer.id = options.uid;

// Set the textContent property of the local video container to the local user id.
localPlayerContainer.textContent = "Host"


// Set the local video container size.
localPlayerContainer.style.width = "540px";
localPlayerContainer.style.height = "480px";
localPlayerContainer.style.padding = "0 5px 5px 5px";
localPlayerContainer.style.background = "#747bff";
localPlayerContainer.style.color = "#f5f5f5";
localPlayerContainer.style.marginLeft = "10px";


// Set the remote video container size.
remotePlayerContainer.style.width = "540px";
remotePlayerContainer.style.height = "480px";
remotePlayerContainer.style.padding = "0 5px 5px 5px";
remotePlayerContainer.style.background = "#747bff";
remotePlayerContainer.style.color = "#f5f5f5";

// Listen for the "user-published" event to retrieve a AgoraRTCRemoteUser object.
agoraEngine.on("user-published", async (user, mediaType) =>
{
// Subscribe to the remote user when the SDK triggers the "user-published" event.
await agoraEngine.subscribe(user, mediaType);
console.log("subscribe success");

// Subscribe and play the remote video in the container If the remote user publishes a video track.
if (mediaType == "video")
{
    // Retrieve the remote video track.
    channelParameters.remoteVideoTrack = user.videoTrack;

    // Retrieve the remote audio track.
    channelParameters.remoteAudioTrack = user.audioTrack;

    // Save the remote user id for reuse.
    channelParameters.remoteUid = user.uid.toString();

    // Specify the ID of the DIV container. You can use the uid of the remote user.
    remotePlayerContainer.id = user.uid.toString();
    channelParameters.remoteUid = user.uid.toString();
    remotePlayerContainer.textContent = "Guest"

    // Append the remote container to the page body.
    document.body.append(remotePlayerContainer);

    // Play the remote video track.
    channelParameters.remoteVideoTrack.play(remotePlayerContainer);
}
// Subscribe and play the remote audio track If the remote user publishes the audio track only.
if (mediaType == "audio")
{
    // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
    channelParameters.remoteAudioTrack = user.audioTrack;

    // Play the remote audio track. No need to pass any DOM element.
    channelParameters.remoteAudioTrack.play();

}

    });
window.onload = () => {


    localPlayerContainer.classList.add(`player-${localPlayerContainer.uid}`);
    remotePlayerContainer.classList.add(`player-${remotePlayerContainer.uid}`);
    
    const leaveButton = document.getElementById('leave-btn');
    leaveButton.style.display = "none";
   
    // Listen to the Join button click event.
    const joinButton = document.getElementById("join-btn");
    joinButton.onclick = async () =>
    {
        

        // Join a channel.
        await agoraEngine.join(options.appId, options.channel, options.token, options.uid);
        // Create a local audio track from the audio sampled by a microphone.
        channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        // Create a local video track from the video captured by a camera.
        channelParameters.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        // Append the local video container to the page body.
        document.body.append(localPlayerContainer);
        // Publish the local audio and video tracks in the channel.
        await agoraEngine.publish([channelParameters.localAudioTrack, channelParameters.localVideoTrack]);
        // Play the local video track.
        channelParameters.localVideoTrack.play(localPlayerContainer);

        
        
        
        //Once the user is on the session we can display the leave button
        leaveButton.style.display = "inline";
        joinButton.style.display = "none";
    }
    
     

    leaveButton.onclick = async () =>
    {
        // Destroy the local audio and video tracks.
        channelParameters.localAudioTrack.close();
        channelParameters.localVideoTrack.close();
        // Remove the containers you created for the local video and remote video.

    
        
        

        
        
        // Leave the channel
        await agoraEngine.leave();
        console.log("You left the call");

        // Refresh the page for reuse
        window.location.reload();
    }
}
}
startBasicCall();

