import express from "express"
import fetch from "node-fetch"

const app = express()
app.use(express.json())

// 调用 Coze 工作流
app.post("/run", async (req, res) => {
  try {
    const userInput = req.body.input

    const r = await fetch("https://api.coze.cn/v1/workflow/stream_run", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COZE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        workflow_id: process.env.WORKFLOW_ID,
        parameters: { input: userInput }
      })
    })

    // 拿 streaming，取最后一条输出
    const reader = r.body!.getReader()
    let result = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      result += Buffer.from(value).toString()
    }

    res.json({ result })

  } catch (e) {
    res.status(500).json({ error: e.toString() })
  }
})

app.get("/", (_, res) => {
  res.send("Coze Card Service Running")
})

export default app
