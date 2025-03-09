

app.get("/api/album/:id", async (req, res) => {
    const albmId = req.params.id;
    
    try {
      const { data } = await axios.get(`https://api.deezer.com/album/${albumId}`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Error fetching album data" });
    }
  });