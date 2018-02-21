import { createChat } from "./controllers/createChat.js";
import { joinChat } from "./controllers/joinChat.js";
import { index } from "./controllers/index.js";

'use strict';

(() =>{
  let rtcConfig = {
    controller: null
  };
  
  const router = new Navigo(null, true, '#!');
  router.hooks({
    /*before: (done, params) => {
      done();
    }*/
    leave: function(params){
      if (rtcConfig.controller){
        rtcConfig.controller.close();
      }
    }
  });
  router.on('create-chat', () => createChat(rtcConfig, router));
  router.on('join-chat', () => joinChat(rtcConfig, router));
  router.on(() => index(router));
  router.resolve();
})();
