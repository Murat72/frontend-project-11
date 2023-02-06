import uniqueId from 'lodash/uniqueId.js';

export default (rss) => {
  const parser = new DOMParser();
  const parsedRss = parser.parseFromString(rss.data.contents, 'application/xml');
  const parsedError = parsedRss.querySelector('parsererror');

  if (parsedError) {
    throw new Error('ParseError');
  } else {
    const feedId = uniqueId();
    const feed = {
      id: feedId,
      title: parsedRss.querySelector('title').textContent,
      description: parsedRss.querySelector('description').textContent
    }
    const posts = Array.from(parsedRss.querySelectorAll('item'))
      .map((item) => ({
        id: uniqueId(),
        feedId,
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,      
      }));
    return [feed, posts];
  }
};