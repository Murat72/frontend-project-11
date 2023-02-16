import axios from 'axios';

const buildUrlWithProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('disableCache', 'true');
  urlWithProxy.searchParams.set('url', url);
  return urlWithProxy.toString();
};

export default (url) => {
  const proxyUrl = buildUrlWithProxy(url);
  return axios.get(proxyUrl);
};
