const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const app = express();

app.use(cors());
const upload = multer();

app.post('/api/alterar', upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const API_KEY = "sk-2yePsnsJOqnX7WmGQx6IKRYOyA8UIs3RlwzjANp2Rwp26BRP"; // REINSERIR AQUI

        // Prompt de Elite: Força o realismo fotográfico extremo
        const promptElite = `${prompt}, raw photo, 8k uhd, dslr, soft lighting, high quality, film grain, Fujifilm XT4`;

        const formData = new FormData();
        formData.append('init_image', req.file.buffer, 'image.png');
        formData.append('text_prompts[0][text]', promptElite);
        formData.append('image_strength', 0.35); // Força menor = mais realismo da foto original
        formData.append('init_image_mode', 'IMAGE_STRENGTH');

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            formData,
            { headers: { ...formData.getHeaders(), Authorization: `Bearer ${API_KEY}` } }
        );

        res.json({ image: `data:image/png;base64,${response.data.artifacts[0].base64}` });
    } catch (error) {
        res.status(500).send("Erro na IA: Verifique se a foto não é grande demais.");
    }
});
app.listen(10000);
