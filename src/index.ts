import express from "express"
import path from "path"

const app = express()
app.use(express.json())

// ---- 让 public/ 中的 html css js 可直接访问 ----
app.use(express.static(path.join(process.cwd(), "public")))

// ---- 调用 Coze workflow ----
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


// 首页 -> 自动发送 public/index.html
app.get("/", (_, res) => {
  res.sendFile(path.resolve("public/index.html"))
})

export default app
