import { getView } from "../cachedViewLoader.js";

'use strict';

export const index = async (router) => {
  const page = await getView('js/views/main.html', router);
  $('.page').html(page);
};