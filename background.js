chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      if (details.url.endsWith("page-6553.1db3fd1c.js")) {
        return {redirectUrl: chrome.runtime.getURL("replacement.js")};
      }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
  );