import getRss from "./getRss.js";
import parse from './parser.js';
import _ from 'lodash';

export default (watchedState) => {
  const cb = () => {
    const urls = watchedState.feeds.map((feed) => feed.url);
    if (!_.isEmpty(urls)) {
      urls.map((url) => {
        getRss(url)
          .then((rss) => {
            const [feed, posts] = parse(rss);
            const actualFeed = {...feed, url};
            const feedId = _.find(watchedState.feeds, (item) => item.url === actualFeed.url).id;
            const actualPosts = posts.map((post) => ({id: _.uniqueId(), feedId, ...post}));
            const diffPosts = _.differenceBy(actualPosts, Array.from(watchedState.posts), 'title');
            if(diffPosts.length !== 0) {
              watchedState.posts = [...diffPosts, ...watchedState.posts];
            }
          })
      });
    }
    setTimeout(cb, 5000);
  }
  cb();
}