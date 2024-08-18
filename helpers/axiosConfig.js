import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://apimobile.testingtest.fr/api',
});

export default instance;