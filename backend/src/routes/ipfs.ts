// backend/src/routes/ipfs.ts
import { Router }   from 'express';
import multer       from 'multer';
import FormData     from 'form-data';
import fetch        from 'node-fetch';

const router  = Router();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const PINATA_JWT     = process.env.PINATA_JWT!;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY!;

// POST /api/ipfs/upload — upload file, get real CID back
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('pinataMetadata', JSON.stringify({
      name: `fairpay-${Date.now()}-${req.file.originalname}`,
    }));
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
    }));

    const response = await fetch(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      {
        method:  'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders(),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Pinata upload error]', errText);
      return res.status(502).json({ error: 'IPFS upload failed', detail: errText });
    }

    const data = await response.json() as { IpfsHash: string; PinSize: number };

    return res.json({
      cid:     data.IpfsHash,
      url:     `https://${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
      size:    data.PinSize,
      gateway: PINATA_GATEWAY,
    });

  } catch (err) {
    console.error('[POST /api/ipfs/upload]', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/ipfs/json — pin JSON metadata (for NFTs)
router.post('/json', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'JSON body required' });
  }

  try {
    const response = await fetch(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataContent:  req.body,
          pinataMetadata: { name: `fairpay-metadata-${Date.now()}` },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'JSON pin failed', detail: errText });
    }

    const data = await response.json() as { IpfsHash: string };
    return res.json({
      cid: data.IpfsHash,
      url: `https://${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
    });

  } catch (err) {
    console.error('[POST /api/ipfs/json]', err);
    return res.status(500).json({ error: 'JSON pin failed' });
  }
});

// GET /api/ipfs/test — verify Pinata connection
router.get('/test', async (_req, res) => {
  try {
    const response = await fetch(
      'https://api.pinata.cloud/data/testAuthentication',
      { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
    );
    const data = await response.json();
    return res.json({ pinata: response.ok ? 'connected' : 'error', detail: data });
  } catch (err) {
    return res.status(500).json({ pinata: 'unreachable', error: (err as Error).message });
  }
});

export default router;
