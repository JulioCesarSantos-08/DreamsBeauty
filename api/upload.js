// api/upload.js
import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error al leer el formulario' });
      return;
    }

    const file = files.imagen;
    if (!file) {
      res.status(400).json({ error: 'No se envió ningún archivo' });
      return;
    }

    const { filepath, originalFilename } = file;
    const fileStream = fs.createReadStream(filepath);
    const blob = await put(`productos/${originalFilename}`, fileStream, {
      access: 'public',
    });

    res.status(200).json({ url: blob.url });
  });
}