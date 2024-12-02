self.onmessage = (e: MessageEvent) => {
    console.log('Message received from main script');
    const data = e.data;
    self.postMessage(`Processed: ${data}`);
  };