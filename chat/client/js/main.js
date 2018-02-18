import { DataStreamController } from "./dataStreamController.js";
import { getHashPath, initHighlight } from "./utils.js";

'use strict';

(async () =>{
  
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
  
  const pageCache = {};
  const router = new Navigo(null, true, '#!');
  router
    .on({
      'create-chat': async function(){
        let page = await getView('js/views/createChat.html', router);
        // render page
        $('.page').html(page);
        
        initHighlight('pre.language-sdp');
      },
      'join-chat': function(){
        $('.page').load('js/views/joinChat.html');
      },
      '*': function(){
        $('.page').load('js/views/main.html');
      }
    })
    .resolve();
  
  const dsc = new DataStreamController();
  
  //dsc.sendData("penis");
  //dsc.closeDataChannels();
  
})();

const foo = args =>{
  args();
};