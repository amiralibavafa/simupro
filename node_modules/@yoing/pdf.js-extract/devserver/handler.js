const Busboy = require('busboy');
const {createWriteStream} = require('fs');
const {join} = require('path');
const cors = require('cors');
const {PDFExtract} = require('../lib');

const applyCors = cors({origin: true});

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    try {

        applyCors(req, res, async () => {
            const {type} = req.query;

            // todo: Make a factory
            const parser = new PDFExtract();

            const {parsedBooks} = await new Promise((resolve, reject) => {
                const busboy = new Busboy({headers: req.headers});

                const fileProcessingPromises = [];

                busboy.on('file', (_, file) => {
                    let fileIndex = fileProcessingPromises.length;

                    fileProcessingPromises.push(new Promise((resolve, reject) => {
                        let buffer = null;
                        let filePath = join(__dirname, `tmp-${fileIndex}.pdf`);

                        file.pipe(createWriteStream(filePath))

                        file.on('error', error => {
                            reject(error);
                        });
                        file.on('end', () => {
                            resolve(filePath);
                        });
                    }));

                });

                busboy.on('finish', async () => {
                    const booksPaths = await Promise
                        .all(fileProcessingPromises)
                        .catch(reject);

                    const opts = {}
                    const parsedBooks = await Promise
                        .all(booksPaths.map(path => parser.extract(path, opts)))
                        .catch(reject)

                    resolve({parsedBooks});
                });

                req.pipe(busboy);
            });

            res.json({type, parsedBooks});
        });
    } catch (error) {
        res.status(500);
        res.json({error})
    }


};

module.exports = {handler};
