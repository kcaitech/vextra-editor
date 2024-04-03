import { FilePicker } from '@/components/common/filepicker';
import { LzDataLocal } from '@/basic/lzdatalocal'; // todo
import { Repository, CoopRepository, Document, createDocument, DocEditor, importSketch, importFigma } from '@kcdesign/data';
import { Zip } from "@pal/zip";
import i18n from '@/i18n'
import { router } from '@/router'

export const newFile = () => {
    const repo = new Repository();
    // @ts-ignore
    const nd = createDocument(i18n.global.t('system.new_file'), repo);
    const coopRepo = new CoopRepository(nd, repo)
    coopRepo.setInitingDocument(true);
    const editor = new DocEditor(nd, coopRepo);
    const page = editor.create(i18n.global.t('system.page1'));
    editor.insert(0, page);
    coopRepo.setInitingDocument(false);
    window.document.title = nd.name;
    (window as any).skrepo = coopRepo;
    (window as any).sketchDocument = nd;
    router.push({ name: 'document' });
}

export const picker = new FilePicker('.sketch,.fig', (file) => {
    if (!file) return;
    let loader;
    const repo = new Repository();
    if (file.name.endsWith('.fig')) {
        loader = importFigma(file, repo);
    } else {
        const lzdata = new LzDataLocal(new Zip(file));
        loader = importSketch(file.name, lzdata, repo);
    }
    loader.then((document: Document) => {
        window.document.title = document.name;
        const coopRepo = new CoopRepository(document, repo);
        (window as any).skrepo = coopRepo;
        (window as any).sketchDocument = document;
        router.push({ name: 'document' });
    })
});
