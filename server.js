const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } });

app.post('/api/alterar', upload.single('image'), async (req, res) => {
    try {
        const { prompt, strength } = req.body;
        if (!req.file) return res.status(400).send('Nenhuma imagem enviada.');

        // LEMBRE-SE DE COLOCAR SUA CHAVE NOVA DA STABILITY AI AQUI
        const API_KEY = "sk-XgnhZKs2mx8GObxPtdV98skw9au6fgdzne5UF1KqXwffb5Zk"; 

        const formData = new FormData();
        formData.append('init_image', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        
        const promptMaster = `${prompt}, photorealistic, 4k resolution, cinematic lighting, highly detailed studio quality, professional photography, eliminate noise`;
        
        formData.append('text_prompts[0][text]', promptMaster);
        formData.append('text_prompts[0][weight]', '1.0');
        
        const imageStrength = 1 - parseFloat(strength || 0.55);
        formData.append('image_strength', imageStrength.toString());
        formData.append('init_image_mode', 'IMAGE_STRENGTH');

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${API_KEY}`,
                    Accept: 'application/json',
                },
            }
        );

        const base64Image = response.data.artifacts[0].base64;
        res.json({ image: `data:image/png;base64,${base64Image}` });

    } catch (error) {
        res.status(500).send(error.response ? error.response.data : error.message);
    }
});

app.listen(port, () => console.log(`Rodando na porta ${port}`));
