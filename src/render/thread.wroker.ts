self.onmessage = (e: MessageEvent) => {
    console.log('Message received from main script');
    const data = e.data as { id: number, args: any };
    self.postMessage(`Processed: ${data}`);
};