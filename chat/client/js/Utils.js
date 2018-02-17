'use strict';

let __traceIncrement = 1;

export function trace(msg){
  console.log(`${__traceIncrement++}: ${msg}`);
}