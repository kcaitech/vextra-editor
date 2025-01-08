self.onmessage = (e: MessageEvent) => {
    const data = e.data as { id: number, args: any };

    let result
    let err
    try {
        result = render(data.args)
    } catch (e) {
        console.error(e)
        err = e
    }

    self.postMessage({id: data.id, result, err });
}

function render(args: {}) {

}