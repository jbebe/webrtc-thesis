import { getHashPath } from "./utils.js";

'use strict';

const pageCache = {};

export const getView = async (viewUrl, router) =>{
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