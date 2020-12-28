'use strict';

const handleMessage = message => {
  // console.log(message);

  if (message.data.type === 'clearLocalStorage') {
    return localStorage.clear();
  }

  if (message.data.type === 'getLocalStorageItem') {
    return localStorage.getItem(message.data.key);
  }

  if (message.data.type === 'setLocalStorageItem') {
    return localStorage.setItem(message.data.key, message.data.value);
  }
};

window.addEventListener('message', message => {
  const { data } = message;

  if (!data || !data.__test_runner_request__) {
    return;
  }

  const handleResponse = response => {
    window.postMessage(
      { __test_runner_response__: true, commandId: data.commandId, ...response },
      window.location.href,
    );
  };

  try {
    handleResponse({ success: true, ...handleMessage(message) });
  } catch (error) {
    handleMessage({ success: false, error });
  }
});

window.postMessage({ __test_runner_content_script__: true });
