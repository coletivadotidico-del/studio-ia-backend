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
        // COLE SUA CHAVE AQUI
        const API_KEY = "sk-XgnhZKs2mx8GObxPtdV98skw9au6fgdzne5UF1KqXwffb5Zk"; 
        const formData = new FormData();
        
        formData.append('init_image', req.file.buffer, 'img.png');
        formData.append('text_prompts[0][text]', req.body.prompt + ", photorealistic, 8k, cinematic lighting");
        formData.append('text_prompts[0][weight]', 1);
        formData.append('image_strength', 0.45);
        formData.append('init_image_mode', 'IMAGE_STRENGTH');

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            formData,
            { headers: { ...formData.getHeaders(), Authorization: `Bearer ${API_KEY}` } }
        );

        res.json({ image: `data:image/png;base64,${response.data.artifacts[0].base64}` });
    } catch (error) {
        res.status(500).send("Erro na conexão com Stability AI");
    }
});

app.listen(process.env.PORT || 10000);
