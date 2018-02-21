import { trace, initHighlight } from "../utils.js";
import { getView } from "../cachedViewLoader.js";
import { RtcClientController } from "../webRtc/rtcClientController.js";

'use strict';

export const joinChat = async (rtcConfig, router) => {
  const page = await getView('js/views/chat.html', router);
  
  // render view
  const rendered = Mustache.render(page, {
    'user-type': 'client',
    'modal': {
      'title': 'Add Server\'s SDP Header',
      'body': `<textarea class="console col-sm-12" style="height:15rem"></textarea>`,
      'cancel': 'Cancel',
      'ok': 'Add'
    }
  }, {
    /*user: userTemplate*/
  });
  $('.page').html(rendered);
  
  // create copy sdp button
  const clipboard = new Clipboard('#copy-sdp');
  clipboard.on('success', function(e){
    const $copySdpBtn = $('#copy-sdp');
    $copySdpBtn
      .prop('title', 'Copied successfully!')
      .tooltip('enable')
      .tooltip('show');
    $copySdpBtn.on('hidden.bs.tooltip', () =>{
      $copySdpBtn.tooltip('disable');
    });
  });
  
  const rtcController = new RtcClientController({
    streamingMediaElement: $('#receive-video')[0],
    receivingMediaElement: $('#stream-video')[0],
    onMessage: message => {
      $('.chat-window').append(`<div>${message}</div>`);
    },
    onFileUploaded: options => {
      $('.chat-window').append(`<div><a href="${options.url}">${options.filename} (${options.bytes})</a></div>`);
    }
  });
  rtcConfig.controller = rtcController;
  rtcController.init();
  
  // handle add sdp
  $('.modal-accept-btn').click(async function(event){
    const sdpValue = $(this).closest('.modal-content').find('textarea.console').val();
    $('#sdpInputModal').modal('hide');
    trace(sdpValue);
    rtcController.acceptOffer(JSON.parse(sdpValue));
    rtcController.getLocalDescription().then(description => {
      $('#sdp-content').text(JSON.stringify(description));
      // highlight syntax
      initHighlight('pre.language-sdp');
    }).catch(trace);
  });
  
  $('.chat-input').keypress(function (event){
    if (event.which === 13){
      const $this = $(this);
      $('.chat-window').append(`<div>${$this.val()}</div>`);
      rtcController.send({ message: $this.val() });
      $this.val('');
      event.preventDefault();
      return false;
    }
  });
  
  // focus on textarea
  $('#sdpInputModal').on('shown.bs.modal', function(event){
    $('#sdpInputModal').find('textarea').focus();
  });

};