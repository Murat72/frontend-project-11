import _ from 'lodash';
import getRss from './getRss.js';
import parse from './parser.js';

export default (view) => {
  const cb = () => {
    const urls = view.feeds.map((feed) => feed.url);
    if (!_.isEmpty(urls)) {
      urls.map((url) => (
        getRss(url)
          .then((rss) => {
            const [feed, posts] = parse(rss);
            const actualFeed = { ...feed, url };
            const feedId = _.find(view.feeds, (item) => item.url === actualFeed.url).id;
            const actualPosts = posts.map((post) => ({ id: _.uniqueId(), feedId, ...post }));
            const diffPosts = _.differenceBy(actualPosts, Array.from(view.posts), 'title');
            if (diffPosts.length !== 0) {
              view.posts = [...diffPosts, ...view.posts];
            }
          })
      ));
    };
    setTimeout(cb, 5000);
  };
  cb();
};
