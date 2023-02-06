import * as yup from 'yup';
import i18n from 'i18next';
import ru from './locales/ru.js';
import axios from 'axios';
import render from './views.js';
import parse from './parser.js';

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
const getRss = (url) => {
  return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
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
  };

  const elements = {
    formEl: document.querySelector('form'),
    inputEl: document.querySelector('#url-input'),
    addEl: document.querySelector('button'),
    feedBack: document.querySelector('.feedback'),
    feedsDiv: document.querySelector('.feeds'),
    postsDiv: document.querySelector('.posts'),
  };

  const watchedState = render(initialState, elements, i18nInstance);
  const existedUrls = [];
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
        const actualFeed = {...feed, url};
        watchedState.formProcess.processState = 'loaded';
        watchedState.feeds = [actualFeed, ...watchedState.feeds];
        console.log(initialState.feeds);
        watchedState.posts = [...posts, ...watchedState.posts];
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
        } else {
          watchedState.formProcess.processError = i18nInstance.t('form.errors.unknownError');
        }
        watchedState.formProcess.processState = 'filling';
      });
  });
};