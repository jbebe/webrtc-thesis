'use strict';

export function trace(msg){
  console.log(msg);
  const $debugLog = $('.debug-log');
  $debugLog.append(`<div>${msg}</div>`).scrollTop($debugLog[0].scrollHeight);
}

export function getHashPath(hash){
  hash = hash || location.hash;
  const path = location.hash.replace(/\/?(?:#!)?\/?/g, '');
  return path || '/';
}

function highlightSdp(text){
  // categories
  text = text.replace(/([vosiuepcbOzkatrm]=)/g, c => {
    return `<b class="kw">${c}</b>`;
  });
  
  // numbers
  text = text.replace(/(?:^|\s)(\d+)(?:\s|$)/g, c => {
    return `<b class="n">${c}</b>`;
  });
  return text;
}

export function initHighlight(pattern){
  $(pattern).each(function(){
    const $this = $(this);
    if ($this.data('isHighlighted') !== 'true'){
      $this.html(highlightSdp($this.text()));
      $this.data('isHighlighted', 'true');
    }
  })
}
