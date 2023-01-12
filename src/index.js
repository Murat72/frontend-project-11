import './scss/styles.scss'
import * as bootstrap from 'bootstrap'

const container = document.createElement('div');
container.classList.add('container');

const row = document.createElement('div');
row.classList.add('row', 'justify-content-md-center');

const col1 = document.createElement('div');
col1.classList.add('col', 'col-lg-2');

const col2 = document.createElement('div');
col2.classList.add('col-md-auto');

const input = document.createElement('input');
input.setAttribute('type', 'text');
input.setAttribute('placeholder', 'Ссылка RSS')

const btn = document.createElement('button');
btn.innerHTML = 'Добавить';

document.body.appendChild(container);
container.appendChild(row);
row.appendChild(col1);
row.appendChild(col2);
col1.appendChild(input);
col2.appendChild(btn);