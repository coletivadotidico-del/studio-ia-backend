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

// Novo endpoint apontando para a API Ultra/SD3 da Stability AI
app.post('/api/alterar', upload.single('image'), async (req, res) => {
    try {
        const { prompt, strength } = req.body;
        if (!req.file) return res.status(400).send('Nenhuma imagem enviada.');

        // ⚠️ COLE A SUA CHAVE DA STABILITY AI AQUI DENTRO DAS ASPAS:
        const API_KEY = "sk-XgnhZKs2mx8GObxPtdV98skw9au6fgdzne5UF1KqXwffb5Zk"; 

        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        
        // Injeção de prompts de fotografia profissional de altíssimo nível (invisível no app)
        const promptMaster = `${prompt}, high-end professional commercial photography, hyper-realistic skin texture, 8k resolution, cinematic studio lighting, shot on 85mm lens, highly detailed background, realistic depth of field, award-winning composition, no distortions`;
        
        formData.append('prompt', promptMaster);
        formData.append('output_format', 'png');
        formData.append('mode', 'image-to-image');
        
        // Converte a força para o padrão que o novo modelo exige (0.0 a 1.0)
        const strengthValue = parseFloat(strength || 0.55);
        formData.append('strength', strengthValue.toString());

        // Chamando a nova e mais potente API de controle de imagem (Stable Diffusion 3 / Ultra)
        const response = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/control/image-to-image',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${API_KEY}`,
                    Accept: 'image/*', // A API nova já devolve a imagem direto em vez de JSON string
                },
                responseType: 'arraybuffer' // Recebe o arquivo puro de alta definição
            }
        );

        // Transforma a imagem pura recebida em Base64 para o seu site do Netlify exibir na hora
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        res.json({ image: `data:image/png;base64,${base64Image}` });

    } catch (error) {
        // Trata os erros detalhados da nova API
        if (error.response && error.response.data) {
            try {
                const errorText = Buffer.from(error.response.data).toString();
                res.status(500).send(errorText);
            } catch (e) {
                res.status(500).send("Erro na geração de alta definição.");
            }
        } else {
            res.status(500).send(error.message);
        }
    }
});

app.listen(port, () => console.log(`Rodando na porta ${port}`));
