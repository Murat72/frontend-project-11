import * as yup from 'yup';
import i18n from 'i18next';
import ru from './locales/ru.js';
import render from './views.js';
import getRss from './getRss.js';
import parse from './parser.js';
import update from './update.js';
import uniqueId from 'lodash/uniqueId.js';

const validateUrl = async (url, existedUrls, i18nInstance) => {
  yup.setLocale({
    string: {
      url: i18nInstance.t('form.errors.invalidUrl'),
    },
    mixed: {
      required: i18nInstance.t('form.errors.required'),
      notOneOf: i18nInstance.t('form.errors.notUniqueUrl'),
    },
  });

  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(existedUrls);

  return schema.validate(url)
    .catch((error) => {
      throw error;
    });
};

export default async () => {
  const i18nInstance = i18n.createInstance();
  await i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });

  const initialState = {
    formProcess: {
      valid: true,
      processState: 'filling',
      processError: null,
    },
    posts: [],
    feeds: [],
    ui: {
      postId: null,
      visitedPosts: [],
    },
  };

  const elements = {
    formEl: document.querySelector('form'),
    inputEl: document.querySelector('#url-input'),
    addEl: document.querySelector('button'),
    feedBack: document.querySelector('.feedback'),
    feedsDiv: document.querySelector('.feeds'),
    postsDiv: document.querySelector('.posts'),
    modalWindow: document.querySelector('#modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalBtn: document.querySelector('.full-article'),
  };

  const watchedState = render(initialState, elements, i18nInstance);
  update(watchedState);
  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.inputEl.value;
    watchedState.formProcess.valid = true;
    const urls = watchedState.feeds.map((feed) => feed.url);
    console.log(urls);
    validateUrl(url, urls, i18nInstance)
      .then((url) => {
        watchedState.formProcess.processError = null;
        watchedState.formProcess.processState = 'sending';
        return getRss(url);
      })
      .then((rss) => {
        const [feed, posts] = parse(rss);
        const feedId = uniqueId();
        const actualFeed = {id: feedId, url, ...feed};
        const actualPosts = posts.map((post) => ({ id: uniqueId(), feedId, ...post }));
        watchedState.formProcess.processState = 'loaded';
        watchedState.feeds = [actualFeed, ...watchedState.feeds];
        watchedState.posts = [...actualPosts, ...watchedState.posts];
      })
      .catch((error) => {
        console.log(error);
        watchedState.formProcess.valid = error.name !== 'ValidationError';
        if (error.name === 'ValidationError') {
          watchedState.formProcess.processError = error.message;
          console.log(initialState.formProcess);
        } else if (error.message === 'ParseError') {
          watchedState.formProcess.processError = i18nInstance.t('form.errors.invalidRss');
        } else if (error.name === 'AxiosError') {
          watchedState.formProcess.processError = 'form.errors.networkProblems';
        }
        watchedState.formProcess.processState = 'filling';
      });
  });

  elements.modalWindow.addEventListener('show.bs.modal', (event) => {
    console.log(event.relatedTarget);
    const postId = event.relatedTarget.dataset.id;
    if (initialState.ui.visitedPosts.includes(postId) === false) {
      watchedState.ui.postId = postId;
      initialState.ui.visitedPosts.push(postId);
    }
  });
};