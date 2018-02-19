import { RtcHostController, RtcClientController } from "./RtcController.js";
import { trace, getHashPath, initHighlight } from "./utils.js";

'use strict';

(() =>{
  
  let getView = async (viewUrl, router) =>{
    return new Promise(resolve =>{
      let page = pageCache[getHashPath()];
      if (page === undefined){
        $.get(viewUrl)
          .done(data =>{
            page = (pageCache[getHashPath()] = data);
            resolve(page);
          })
          .fail((xhr, type, msg) =>{
            $('.global-alert').show().html(
              `${viewUrl} <a href="http://httpstatuses.com/${xhr.status}">[${xhr.status}]</a>: ${xhr.statusText}`
            );
            router.navigate('');
            resolve(page);
          });
      } else {
        resolve(page);
      }
    });
  };
  
  let rtcController = null;
  const pageCache = {};
  const router = new Navigo(null, true, '#!');
  router.hooks({
    /*before: (done, params) => {
      console.log(pageCache);
      done();
    }*/
    leave: function(params){
    
    }
  });
  router
    .on('create-chat', async function(){
        const page = await getView('js/views/chat.html', router);
        
        // render view
        const rendered = Mustache.render(page, {
          'user-type': 'host',
          'modal': {
            'title': 'Add Client\'s SDP Header',
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
        clipboard.on('success', function(event){
          const $copySdpBtn = $('#copy-sdp');
          $copySdpBtn
            .prop('title', 'Copied successfully!')
            .tooltip('enable')
            .tooltip('show');
          $copySdpBtn.on('hidden.bs.tooltip', () =>{
            $copySdpBtn.tooltip('disable');
          });
        });
        
        // handle add sdp
        $('.modal-accept-btn').click(function(event){
          const sdpValue = $(this).closest('.modal-content').find('textarea.console').val();
          rtcController.addRemoteDescription(JSON.parse(sdpValue));
          $('#sdpInputModal').modal('hide');
        });
        
        rtcController = new RtcHostController({
          streamingMediaElement: $('#receive-video')[0],
          receivingMediaElement: $('#stream-video')[0]
        });
        rtcController.init().then(() =>{
          const sdpObj = rtcController.getDescription();
          $('#sdp-content').text(JSON.stringify(sdpObj));
          
          // highlight syntax
          initHighlight('pre.language-sdp');
        });
        
        $('.chat-input').keypress(function (event){
          if (event.which === 13){
            const $this = $(this);
            trace('this val: ' + $this.val());
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
      },
      {
        leave: function(params){
          if (rtcController){
            rtcController.close();
          }
        }
      });
  router.on('join-chat', async function(){
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
      
      // handle add sdp
      $('.modal-accept-btn').click(async function(event){
        const sdpValue = $(this).closest('.modal-content').find('textarea.console').val();
        trace(sdpValue);
        const localSdp = await rtcController.acceptOffer(JSON.parse(sdpValue));
        $('#sdp-content').text(JSON.stringify(localSdp));
  
        // highlight syntax
        initHighlight('pre.language-sdp');
        $('#sdpInputModal').modal('hide');
      });
      
      rtcController = new RtcClientController({
        streamingMediaElement: $('#receive-video')[0],
        receivingMediaElement: $('#stream-video')[0]
      });
      rtcController.init();
      
      // focus on textarea
      $('#sdpInputModal').on('shown.bs.modal', function(event){
        $('#sdpInputModal').find('textarea').focus();
      });
    },
    {
      leave: function(params){
        if (rtcController){
          rtcController.close();
        }
      }
    });
  router.on(async function(){
    const page = await getView('js/views/main.html', router);
    $('.page').html(page);
  });
  router.resolve();
  
})();
