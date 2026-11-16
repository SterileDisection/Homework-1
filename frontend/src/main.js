import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);

app.use(createPinia()); // shared state (stores)
app.use(router); // client-side navigation

app.mount('#app');
