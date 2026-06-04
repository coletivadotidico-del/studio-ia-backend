const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

app.use(cors());
const upload = multer();

// Rota principal para testar se o servidor está vivo
app.get('/', (req, res) => {
    res.send('Servidor está vivo!');
});

// Rota que o seu site chama
app.post('/api/alterar', upload.single('image'), async (req, res) => {
    try {
        const API_KEY = "SUA_CHAVE_AQUI"; // Cole sua chave aqui
        if (!req.file) return res.status(400).send("Sem imagem");

        const formData = new FormData();
        formData.append('init_image', req.file.buffer, 'img.png');
        formData.append('text_prompts[0][text]', req.body.prompt + ", photorealistic, 8k, cinematic");
        formData.append('text_prompts[0][weight]', 1);
        formData.append('image_strength', 0.40);
        formData.append('init_image_mode', 'IMAGE_STRENGTH');

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
            formData,
            { headers: { ...formData.getHeaders(), Authorization: `Bearer ${API_KEY}` } }
        );

        res.json({ image: `data:image/png;base64,${response.data.artifacts[0].base64}` });
    } catch (error) {
        console.error(error); // Isso vai mostrar o erro real no Log do Render
        res.status(500).send("Erro no processamento da IA");
    }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log('Servidor rodando na porta ' + port));
