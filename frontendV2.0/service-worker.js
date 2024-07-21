// self here refers to the worker itself
self.addEventListener('push', function(event) {
  if (event.data) {
    console.log('This push event has data: ', event.data.text());
    const promiseChain = self.registration.showNotification(event.data.text(), {
      body: 'lolkek'
    });
    event.waitUntil(promiseChain);
  } else {
    console.log('This push event has no data.');
  }
});