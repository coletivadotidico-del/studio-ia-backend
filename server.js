const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
app.use(cors());
const upload = multer();

app.post('/api/alterar', upload.single('image'), async (req, res) => {
    try {
        const { prompt, strength } = req.body;
        const API_KEY = "sk-XgnhZKs2mx8GObxPtdV98skw9au6fgdzne5UF1KqXwffb5Zk"; // COLE SUA CHAVE AQUI

        const formData = new FormData();
        formData.append('init_image', req.file.buffer, 'image.png');
        formData.append('text_prompts[0][text]', prompt + ", high resolution, cinematic lighting, photorealistic, 8k");
        formData.append('text_prompts[0][weight]', 1);
        formData.append('image_strength', (1 - parseFloat(strength || 0.55)).toString());
        formData.append('init_image_mode', 'IMAGE_STRENGTH');

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            formData,
            {
                headers: { ...formData.getHeaders(), Authorization: `Bearer ${API_KEY}`, Accept: 'application/json' }
            }
        );

        res.json({ image: `data:image/png;base64,${response.data.artifacts[0].base64}` });
    } catch (error) {
        res.status(500).send(error.response?.data?.message || error.message);
    }
});

app.listen(10000, () => console.log('Servidor OK'));
