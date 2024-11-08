chrome.action.disable();
chrome.declarativeContent.onPageChanged.removeRules(async () => {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { pathPrefix: '/html5client/join', queryPrefix: "?sessionToken=" },
        css: [ 'div[class|="svgContainer"]']
      }),
    ],
    actions: [
      new chrome.declarativeContent.SetIcon({
        imageData: {
          16: await loadImageData('icon/icon16.png'),
          32: await loadImageData('icon/icon32.png'),
          64: await loadImageData('icon/icon64.png'),
          128: await loadImageData('icon/icon128.png'),
        },
      }),
      chrome.declarativeContent.ShowAction
        ? new chrome.declarativeContent.ShowAction()
        : new chrome.declarativeContent.ShowPageAction(),
    ],
  }]);
});

// SVG icons aren't supported yet
async function loadImageData(url) {
  const img = await createImageBitmap(await (await fetch(url)).blob());
  const {width: w, height: h} = img;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['grab.js']
  });
});