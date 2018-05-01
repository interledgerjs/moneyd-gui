// Small library to improve on fetch() usage
// https://stackoverflow.com/a/45154118/79534
const api = function (method, url, data, headers = {}) {
  return fetch(url, {
    method: method.toUpperCase(),
    body: JSON.stringify(data), // send it as stringified json
    credentials: api.credentials, // to keep the session on the request
    headers: Object.assign(api.headers, headers) // extend the headers
  }).then(res => res.ok ? res.json() : Promise.reject(res))
}

// Defaults that can be globally overwritten
api.credentials = 'include'
api.headers = {
  'csrf-token': window.csrf || '', // only if globally set, otherwise ignored
  'Accept': 'application/json', // receive json
  'Content-Type': 'application/json' // send json
};

// Convenient methods
['get', 'post', 'put', 'delete'].forEach(method => {
  api[method] = api.bind(null, method)
})
