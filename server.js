const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const initDatabase = require('./db/init');
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false }
};

async function startApp(){
    await initDatabase(dbConfig);
    const pool = mysql.createPool(dbConfig);

    app.get("/api/tasks", async (req, res) => {
        try{
            const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
            res.json(rows);
        }catch(err){
            console.error(err);
            res.status(500).json({ error: "Failed to fetch tasks" });
        }
    });

    app.post("/api/tasks", async (req, res) => {
        try {
            const { title } = req.body;
            if (!title || title.trim() === '') {
                return res.status(400).json({ error: "Title is required" });
            }
            await pool.query("INSERT INTO tasks (title) VALUES (?)", [title]);
            res.status(201).json({ message: "Task added successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to add task" });
        }
    });

    app.put("/api/tasks/:id/toggle", async (req, res) => {
        try {
            const [task] = await pool.query("SELECT completed FROM tasks WHERE id = ?", [req.params.id]);
            if (!task || task.length === 0) {
                return res.status(404).json({ error: "Task not found" });
            }
            const newStatus = task[0].completed ? 0 : 1;
            await pool.query("UPDATE tasks SET completed = ? WHERE id = ?", [newStatus, req.params.id]);
            res.json({ message: "Task status updated successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to toggle task status" });
        }
    });

    app.delete("/api/tasks/:id", async (req, res) => {
        try {
            await pool.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
            res.json({ message: "Task deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to delete task" });
        }
    });
    
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}

startApp();