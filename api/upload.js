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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error al parsear formulario:', err);
      return res.status(500).json({ error: 'Error al leer el formulario' });
    }

    const file = files.imagen;
    if (!file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    try {
      const { filepath, originalFilename } = file;
      const fileStream = fs.createReadStream(filepath);

      // Usamos el token de entorno
      const blob = await put(`productos/${originalFilename}`, fileStream, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({ url: blob.url });
    } catch (error) {
      console.error('Error al subir a Vercel Blob:', error);
      return res.status(500).json({ error: 'Error al subir archivo' });
    }
  });
}