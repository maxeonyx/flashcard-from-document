import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Create Vue app instance
const app = createApp(App);

// Set up Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Mount the app
app.mount('#app');