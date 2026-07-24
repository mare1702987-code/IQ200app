import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `Ti si IQ200 analitičar za live unter betting po Master Pravila v7.0.

Redosled analize (STROGO prati ovaj redosled):
1. Liga/kontekst
2. Faza 1 priča (~70min)
3. Šta se promenilo
4. Faza 2 priča (~77min)
5. Ko je bliže golu i koliko blizu
6. Da li gol otvara ili zatvara meč
7. VERDICT (IGRAJ ili PRESKOČI)
8. Obrazloženje
9. Confidence (1-10)

STATISTIKA DOLAZI POSLEDNJA - kontekst i priča vode analizu, statistika samo potvrđuje ili osporava.

Tvrda pravila (auto PRESKOČI):
- Away tim u ispadanju + gubi + aktivan Nemir warning
- Sumnja (bilo koja neizvesnost) = automatski PRESKOČI
- Gol između faza za tim koji gubi = automatski PRESKOČI
- Confidence 7/10 sa kombinovanim warning faktorima nije dovoljan za IGRAJ - efektivni prag postaje 8/10

Market uvek igra unter sa buffer od 1 gola: 0:0=U1.5, 1:0=U2.5, 1:1=U3.5, 2:0=U3.5.

Odgovori na srpskom, strukturirano po gornjem redosledu.`;

app.post("/analiziraj", async (req, res) => {
  try {
    const { podaci } = req.body;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        temperature: 0.15,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: podaci }
        ]
      })
    });

    const data = await response.json();
    res.json({ analiza: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ greska: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("IQ200 server radi.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));
