import * as yup from 'yup';
import i18n from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import ru from './locales/ru.js';
import render from './views.js';
import getRss from './getRss.js';
import parse from './parser.js';
import update from './update.js';

const validateUrl = async (url, existedUrls) => {
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

  yup.setLocale({
    string: {
      url: i18nInstance.t('form.errors.invalidUrl'),
    },
    mixed: {
      required: i18nInstance.t('form.errors.required'),
      notOneOf: i18nInstance.t('form.errors.notUniqueUrl'),
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
    titlesEls: document.querySelectorAll('.title'),
    leadEl: document.querySelector('.lead'),
    mutedTextEl: document.querySelector('.text-muted'),
    formEl: document.querySelector('form'),
    labelUrlInput: document.querySelector('label'),
    inputEl: document.querySelector('#url-input'),
    addEl: document.querySelector('[aria-label="add"]'),
    feedBack: document.querySelector('.feedback'),
    feedsDiv: document.querySelector('.feeds'),
    postsDiv: document.querySelector('.posts'),
    modalWindow: document.querySelector('#modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalBtn: document.querySelector('.full-article'),
  };

  elements.titlesEls.forEach((title) => (title.textContent = i18nInstance.t('form.title')));
  elements.leadEl.textContent = i18nInstance.t('form.lead');
  elements.mutedTextEl.textContent = i18nInstance.t('form.mutedText');
  elements.labelUrlInput.textContent = i18nInstance.t('form.label');
  elements.addEl.textContent = i18nInstance.t('form.buttons.addButton');
  const watchedState = render(initialState, elements, i18nInstance);
  update(watchedState);
  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.inputEl.value;
    watchedState.formProcess.valid = true;
    const urls = watchedState.feeds.map((feed) => feed.url);
    validateUrl(url, urls, i18nInstance)
      .then((result) => {
        watchedState.formProcess.processError = null;
        watchedState.formProcess.processState = 'sending';
        return getRss(result);
      })
      .then((rss) => {
        const { feed, posts } = parse(rss);
        const feedId = uniqueId();
        const actualFeed = { id: feedId, url, ...feed };
        const actualPosts = posts.map((post) => ({ id: uniqueId(), feedId, ...post }));
        watchedState.formProcess.processState = 'loaded';
        watchedState.feeds = [actualFeed, ...watchedState.feeds];
        watchedState.posts = [...actualPosts, ...watchedState.posts];
      })
      .catch((error) => {
        watchedState.formProcess.valid = error.name !== 'ValidationError';
        if (error.name === 'ValidationError') {
          watchedState.formProcess.processError = error.message;
        } else if (error.message === 'ParseError') {
          watchedState.formProcess.processError = i18nInstance.t('form.errors.invalidRss');
        } else if (error.name === 'AxiosError') {
          watchedState.formProcess.processError = 'form.errors.networkProblems';
        }
        watchedState.formProcess.processState = 'filling';
      });
  });

  elements.modalWindow.addEventListener('show.bs.modal', (event) => {
    const postId = event.relatedTarget.dataset.id;
    if (initialState.ui.visitedPosts.includes(postId) === false) {
      watchedState.ui.postId = postId;
      initialState.ui.visitedPosts.push(postId);
    }
  });
};
