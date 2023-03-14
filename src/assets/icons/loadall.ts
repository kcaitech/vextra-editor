const requireAll = (r: any) => r.keys().map(r);
requireAll(require.context("./svg", false, /\.svg$/));
