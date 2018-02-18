'use strict';

let __traceIncrement = 1;

export function trace(msg){
  //console.log(`${__traceIncrement++}: ${msg}`);
}

export function getHashPath(hash){
  hash = hash || location.hash;
  return location.hash.replace(/\/?(?:#!)?\/?/g, '');
}

function highlightSdp(text){
  // categories
  text = text.replace(/([vosiuepcbOzkatrm]=)/g, c => {
    console.log(c);
    return `<b class="kw">${c}</b>`;
  });
  
  // numbers
  text = text.replace(/(\d)/g, c => {
    console.log(c);
    return `<b class="kw">${c}</b>`;
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