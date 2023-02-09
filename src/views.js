import onChange from 'on-change';
import _ from 'lodash';


const renderError = (error, elements, i18next) => {
  elements.feedBack.textContent = '';
  if (error) {
    elements.feedBack.classList.remove('text-success');
    elements.feedBack.classList.add('text-danger');
    elements.feedBack.textContent = i18next.t(error);
  }
};

const showValid = (value, elements) => {
  if (!value) {
    elements.inputEl.classList.add('is-invalid');
    return;
  }
  elements.inputEl.classList.remove('is-invalid');
};

const renderFeeds = (feeds, elements) => {
  const divCard = document.createElement('div');
  divCard.setAttribute('class', 'card border-0');

  const divCardBody = document.createElement('div');
  divCardBody.setAttribute('class', 'card-body');
  divCard.append(divCardBody);

  const headerFeed = document.createElement('h2');
  headerFeed.setAttribute('class', 'card-title h4');
  headerFeed.textContent = 'Фиды';
  divCardBody.append(headerFeed);

  const feedsList = document.createElement('ul');
  feedsList.setAttribute('class', 'list-group border-0 rounded-0');
  divCard.append(feedsList);

  feeds.forEach((feed) => {
    const feedEl = document.createElement('li');
    feedEl.setAttribute('class', 'list-group-item border-0 border-end-0');

    const feedTitle = document.createElement('h3');
    feedTitle.setAttribute('class', 'h6 m-0');
    feedTitle.textContent = feed.title;
    feedEl.append(feedTitle);

    const feedDescription = document.createElement('p');
    feedDescription.setAttribute('class', 'm-0 small text-black-50');
    feedDescription.textContent = feed.description;
    feedEl.append(feedDescription);
    feedsList.append(feedEl);
  })
  elements.feedsDiv.innerHTML = '';
  elements.feedsDiv.append(divCard);
};

const renderPosts = (state, elements) => {
  const divCard = document.createElement('div');
  divCard.setAttribute('class', 'card border-0');

  const divCardBody = document.createElement('div');
  divCardBody.setAttribute('class', 'card-body');
  divCard.append(divCardBody);

  const headerPosts = document.createElement('h2');
  headerPosts.setAttribute('class', 'card-title h4');
  headerPosts.textContent = 'Посты';
  divCardBody.append(headerPosts);

  const postsList = document.createElement('ul');
  postsList.setAttribute('class', 'list-group border-0 rounded-0');
  divCard.append(postsList);

  state.posts.forEach((post) => {
    const postEl = document.createElement('li');
    postEl.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0');

    const visitedLink = state.ui.visitedPosts.includes(post.id);
    const classLink = visitedLink ? 'fw-normal link-secondary' : 'fw-bold';
    const postLink = document.createElement('a');
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('class', classLink);
    postLink.setAttribute('data-id', post.id);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.textContent = post.title;

    const buttonEl = document.createElement('button');
    buttonEl.setAttribute('type', 'button');
    buttonEl.setAttribute('class', 'btn btn-outline-primary btn-sm');
    buttonEl.setAttribute('data-id', post.id);
    buttonEl.setAttribute('data-bs-toggle', 'modal');
    buttonEl.setAttribute('data-bs-target', '#modal');
    buttonEl.textContent = 'Просмотр';

    postEl.append(postLink, buttonEl);
    postsList.append(postEl);
  })
  elements.postsDiv.innerHTML = '';
  elements.postsDiv.append(divCard);
};

const renderModalWindow = (state, value, elements) => {
  const post = _.find(state.posts, {id: value});
  elements.modalTitle.textContent = post.title;
  elements.modalBody.textContent = post.description;
  elements.modalBtn.setAttribute('href', post.link);
  const postEl = document.querySelector(`a[data-id="${value}"]`);
  postEl.classList.remove('fw-bold');
  postEl.classList.add('fw-normal', 'link-secondary');
};

const handleProcessState = (state,processState, elements, i18next) => {
  switch (processState) {
    case 'filling':
      break;
    case 'sending':
      elements.formEl.reset();
      elements.inputEl.focus();
      elements.inputEl.classList.remove('is-invalid');
      elements.feedBack.classList.remove('text-danger');
      break;
    case 'loaded':
      elements.formEl.reset();
      elements.inputEl.focus();
      elements.inputEl.classList.remove('is-invalid');
      elements.feedBack.classList.remove('text-danger');
      elements.feedBack.classList.add('text-success');
      elements.feedBack.textContent = i18next.t('form.loaded');
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

export default (state, elements, i18next) => onChange(state, (path, value) => {
  console.log(value);
  switch (path) {
    case 'formProcess.processError':
      renderError(value, elements, i18next);
      break;
    case 'formProcess.valid':
      showValid(value, elements);
      break;
    case 'formProcess.processState':
      handleProcessState(state, value, elements, i18next);
      break;
    case 'feeds':
      renderFeeds(value, elements);
      break;
    case 'posts':
      renderPosts(state, elements);
      break;
    case 'ui.postId':
      renderModalWindow(state, value, elements);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }
});