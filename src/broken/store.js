import { createStore } from 'redux';
import { brokenApp } from './reducers';

export default (window.devToolsExtension ? window.devToolsExtension()(createStore) : createStore)(brokenApp);
